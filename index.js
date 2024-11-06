const fs = require("fs");
const path = require("path");
const zlib = require("zlib"); // For file compression if needed

class FileManager {
	constructor() {
		this.files = {}; // Store file paths with keys
		this.tempFiles = new Set();
		this.aliases = {};

		process.on("exit", this.clearTempFiles);
		process.on("SIGINT", this.clearTempFiles);
		process.on("SIGOUT", this.clearTempFiles);
	}

	// Method to create folders with nested structure
	createFolderStructure(basePath, folderArray) {
		const createFolders = (currentPath, folders) => {
			folders.forEach((folder, index) => {
				if (Array.isArray(folder)) {
					// Create a new path for the nested folder
					const nestedFolderName = folders[index > 0 ? index - 1 : 0]; // Assume the first element is the name of the parent folder
					const nestedFolderPath = path.join(currentPath, nestedFolderName);

					// Create the parent folder if it doesn't exist
					if (!fs.existsSync(nestedFolderPath)) {
						fs.mkdirSync(nestedFolderPath);
					}

					// Call recursively for the nested folders (excluding the first element)
					createFolders(nestedFolderPath, folder);
				} else {
					// Create a sibling folder at the current path
					const newFolderPath = path.join(currentPath, folder);
					if (!fs.existsSync(newFolderPath)) {
						fs.mkdirSync(newFolderPath);
					}
				}
			});
		};
		createFolders(basePath, folderArray);
	}

	// Delete specific folders based on provided structure
	deleteFolderStructure(basePath, folderArray) {
		const traverseAndDelete = (currentPath, structure) => {
			let lastDirPath = null; // Store last directory path for deletion checks

			structure.forEach((item, index) => {
				if (Array.isArray(item)) {
					// Nested structure - recursively handle subdirectories
					if (lastDirPath) {
						traverseAndDelete(lastDirPath, item);
					}

					// Delete the folder if no further sibling array follows and it is empty
					if (lastDirPath && index === structure.length - 1 && this.isDirectoryEmpty(lastDirPath)) {
						this.deleteDirectory(lastDirPath);
					}
				} else {
					// Folder string - create path and save it for conditional deletion check
					lastDirPath = path.join(currentPath, item);

					// Only delete if the folder exists and it's not the base path
					if (fs.existsSync(lastDirPath) && lastDirPath !== basePath) {
						// Check if the next item is not an array to see if we should delete
						const nextItem = structure[index + 1];
						if (!Array.isArray(nextItem) && this.isDirectoryEmpty(lastDirPath)) {
							this.deleteDirectory(lastDirPath);
						}
					}
				}
			});
		};

		// Start the traversal from the base path
		traverseAndDelete(basePath, folderArray);
	}

	// Helper function to delete a directory and all its contents
	deleteDirectory(dirPath) {
		if (fs.existsSync(dirPath)) {
			fs.rmSync(dirPath, { recursive: true, force: true });
			console.log(`Deleted: ${dirPath}`);
		} else {
			console.log(`Directory not found: ${dirPath}`);
		}
	}

	// Helper function to check if directory is empty
	isDirectoryEmpty(dirPath) {
		return fs.existsSync(dirPath) && fs.readdirSync(dirPath).length === 0;
	}

	createBasicFile(filePath, mode = "preserve") {
		this.ensurePathExists(path.dirname(filePath));
		const baseFileName = path.basename(filePath, path.extname(filePath));
		const fileExtension = path.extname(filePath);

		let finalPath = filePath;
		let key = baseFileName;

		switch (mode) {
			case "preserve":
				if (fs.existsSync(filePath)) {
					this.files[key] = filePath;
					return key;
				}
				break;

			case "overwrite":
				fs.writeFileSync(filePath, "");
				break;

			case "unique":
				let counter = 1;
				while (fs.existsSync(finalPath)) {
					finalPath = path.join(path.dirname(filePath), `${baseFileName}_${counter}${fileExtension}`);
					key = `${baseFileName}_${counter}`;
					counter++;
				}
				break;

			default:
				throw new Error("Invalid mode. Use 'preserve', 'overwrite', or 'unique'.");
		}

		// Create the file in 'strict' or 'new' mode if it doesn’t already exist
		fs.writeFileSync(finalPath, "");
		this.files[key] = finalPath;
		return key;
	}

	// Modification for createLogFile method in FileManager class

	createLogFile(directoryPath, namingMode = "date", fileMode = "preserve") {
		this.ensurePathExists(directoryPath);

		let finalPath;
		if (namingMode === "date") {
			// Date Mode: File with today's date
			const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
			finalPath = path.join(directoryPath, `log_${date}.txt`);

			// In 'unique' fileMode, append an increment if a file with today's date exists
			if (fileMode === "unique" && fs.existsSync(finalPath)) {
				let counter = 1;
				while (fs.existsSync(finalPath)) {
					finalPath = path.join(directoryPath, `log_${date}_${counter}.txt`);
					counter++;
				}
			}
		} else if (namingMode === "increment") {
			// Increment Mode: File with incremented number
			const existingFiles = fs
				.readdirSync(directoryPath)
				.filter((file) => file.startsWith("log_") && file.endsWith(".txt"))
				.map((file) => parseInt(file.match(/log_(\d+)\.txt/)[1], 10))
				.filter((num) => !isNaN(num))
				.sort((a, b) => a - b);

			let latestIndex = existingFiles.length ? existingFiles[existingFiles.length - 1] : 0;

			if (fileMode === "unique" || (fileMode === "preserve" && !fs.existsSync(path.join(directoryPath, `log_${latestIndex}.txt`)))) {
				latestIndex += 1; // Create a new incremented file in unique or preserve mode if it doesn't already exist
			}

			finalPath = path.join(directoryPath, `log_${latestIndex}.txt`);
		} else {
			throw new Error("Invalid naming mode specified. Use 'date' or 'increment'.");
		}

		// Handle file creation based on the specified fileMode
		if (fileMode === "preserve" && fs.existsSync(finalPath)) {
			// Do nothing, just use the existing file
		} else if (fileMode === "overwrite") {
			fs.writeFileSync(finalPath, ""); // Clear the file
		} else if (!fs.existsSync(finalPath)) {
			fs.writeFileSync(finalPath, ""); // Create new file if it doesn't exist
		}

		const key = path.basename(finalPath);
		this.files[key] = finalPath;
		return key;
	}

	// Method to create a temporary file
	createTempFile(filePath, mode = "preserve") {
		this.ensurePathExists(path.dirname(filePath));
		const baseFileName = path.basename(filePath);
		let tempKey = `temp_${baseFileName}`; // Consistent prefix for temp files
		let tempPath = path.join(path.dirname(filePath), tempKey);

		switch (mode) {
			case "preserve":
				if (fs.existsSync(tempPath)) {
					// preserve the existing temporary file
					break;
				}
			// If the file doesn't exist, fall through to create it

			case "overwrite":
				// Overwrite any existing temp file with the same name
				fs.writeFileSync(tempPath, "");
				break;

			case "unique":
				// Create a unique temp file by appending an increment if needed
				let counter = 1;
				while (fs.existsSync(tempPath)) {
					tempKey = `temp_${baseFileName}_${counter}`;
					tempPath = path.join(path.dirname(filePath), tempKey);
					counter++;
				}
				fs.writeFileSync(tempPath, "");
				break;

			default:
				throw new Error("Invalid mode specified. Use 'preserve', 'overwrite', or 'unique'.");
		}

		// Track the temp file in the relevant data structures
		this.files[tempKey] = tempPath;
		this.tempFiles.add(tempKey);
		return tempKey;
	}

	addAlias(alias, originalKey) {
		if (!this.files[originalKey]) {
			throw new Error("Original key does not exist");
		}
		if (this.files[alias] || this.aliases[alias]) {
			throw new Error("Alias conflicts with an existing key or alias");
		}
		this.aliases[alias] = originalKey;
	}

	resolveKey(key) {
		return this.aliases[key] || key;
	}

	formatData(data, pretty = true) {
		// If data is not a string, assume it's an object and format as JSON
		if (typeof data == "object") {
			return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
		}
		return data; // If already a string, return as-is
	}

	// Write data to file by key
	writeToFile(key, data, { pretty = true, newline = true }) {
		key = this.resolveKey(key);
		if (this.files[key]) {
			const formattedData = this.formatData(data, pretty);
			fs.writeFileSync(this.files[key], formattedData + (newline ? "\n" : ""));
		} else {
			throw new Error("File not found");
		}
	}

	// Read data from file by key
	readFile(key) {
		key = this.resolveKey(key);
		if (this.files[key]) {
			return fs.readFileSync(this.files[key], "utf-8");
		} else {
			throw new Error("File not found");
		}
	}

	// Append data to file by key
	appendToFile(key, data, { pretty = true, newline = true }) {
		key = this.resolveKey(key);
		if (this.files[key]) {
			const formattedData = this.formatData(data, pretty);
			fs.appendFileSync(this.files[key], formattedData + (newline ? "\n" : ""));
		} else {
			throw new Error("File not found");
		}
	}

	// Rename file
	renameFile(oldKey, newName) {
		oldKey = this.resolveKey(oldKey);
		const oldPath = this.files[oldKey];
		if (oldPath) {
			const newPath = path.join(path.dirname(oldPath), newName);
			fs.renameSync(oldPath, newPath);
			delete this.files[oldKey];
			this.files[newName] = newPath;
		} else {
			throw new Error("File not found");
		}
	}

	// Delete file by key
	deleteFile(key) {
		key = this.resolveKey(key);
		const filePath = this.files[key];
		if (filePath && fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
			delete this.files[key];
			this.tempFiles.delete(key);

			// Remove associated aliases
			for (const alias in this.aliases) {
				if (this.aliases[alias] === key) {
					delete this.aliases[alias];
				}
			}
		} else {
			throw new Error("File not found or already deleted");
		}
	}

	// Check if path exists, create it if not
	ensurePathExists(fullPath) {
		if (!fs.existsSync(fullPath)) {
			fs.mkdirSync(fullPath, { recursive: true });
		}
	}

	// Delete all temporary files on program exit
	clearTempFiles() {
		this.tempFiles.forEach((key) => this.deleteFile(key));
	}

	exists(targetPath) {
		return fs.existsSync(targetPath);
	}

	// Copy a file from srcPath to destPath
	copyFile(srcPath, destPath) {
		fs.copyFileSync(srcPath, destPath);
		const key = path.basename(destPath);
		this.files[key] = destPath;
	}

	// Move a file from srcPath to destPath
	moveFile(srcPath, destPath) {
		fs.renameSync(srcPath, destPath);
		const key = path.basename(destPath);
		this.files[key] = destPath;
		delete this.files[path.basename(srcPath)];
	}

	// Retrieve metadata for a specific file
	getMetadata(filePath) {
		if (!this.exists(filePath)) throw new Error("File does not exist");
		const stats = fs.statSync(filePath);
		return {
			size: stats.size,
			createdAt: stats.birthtime,
			modifiedAt: stats.mtime,
			isDirectory: stats.isDirectory(),
			isFile: stats.isFile(),
		};
	}

	// Search for files in a directory that match a specific query
	search(directoryPath, query) {
		if (!this.exists(directoryPath)) throw new Error("Directory does not exist");

		const results = [];
		const files = fs.readdirSync(directoryPath);

		files.forEach((file) => {
			if (file.includes(query)) {
				results.push(path.join(directoryPath, file));
			}
		});

		return results;
	}

	// Backup a file by creating a copy with a timestamp
	backupFile(filePath) {
		if (!this.exists(filePath)) throw new Error("File does not exist");

		const timestamp = new Date().toISOString().replace(/:/g, "-");
		const backupPath = filePath.replace(/(\.\w+)$/, `_${timestamp}$1`);

		this.copyFile(filePath, backupPath);
		return backupPath;
	}

	// Compress a file and save as .gz
	compressFile(filePath, destPath) {
		if (!this.exists(filePath)) throw new Error("File does not exist");

		const input = fs.createReadStream(filePath);
		const output = fs.createWriteStream(destPath);

		return new Promise((resolve, reject) => {
			input
				.pipe(zlib.createGzip())
				.pipe(output)
				.on("finish", () => resolve(destPath))
				.on("error", reject);
		});
	}
}

const fileManager = new FileManager();

global.fileManager = fileManager;

module.exports = fileManager;

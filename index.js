const fs = require("fs");
const path = require("path");
const zlib = require("zlib"); // For file compression if needed

class FileManager {
	constructor() {
		this.files = {}; // Store file paths with keys
		this.tempFiles = new Set();
		this.aliases = {};
		process.on("exit", (code) => {
			this.clearTempFiles();
		});
	}

	// Method to create folders with nested structure
	createFolderStructure(basePath, folderArray) {
		const createFolders = (currentPath, folders) => {
			folders.forEach((folder) => {
				if (Array.isArray(folder)) {
					createFolders(currentPath, folder);
				} else {
					currentPath = path.join(currentPath, folder);
					if (!fs.existsSync(currentPath)) {
						fs.mkdirSync(currentPath);
					}
				}
			});
		};
		createFolders(basePath, folderArray);
	}

	// Delete specific folders based on provided structure
	deleteFolderStructure(basePath, folderArray) {
		const deleteFolders = (currentPath, folders) => {
			for (let i = 0; i < folders.length; i++) {
				const folder = folders[i];

				if (folder === "*") {
					// Next item is an array of subdirectories to delete
					const subDirsToDelete = folders[i + 1];
					if (Array.isArray(subDirsToDelete)) {
						subDirsToDelete.forEach((subDir) => {
							const subDirPath = path.join(currentPath, subDir);
							this.deleteDirectory(subDirPath);
						});
						i++; // Skip over subdirectory list
					}
				} else if (folder === "..") {
					// Go up a directory
					currentPath = path.dirname(currentPath);
				} else {
					// Go into the specified folder
					currentPath = path.join(currentPath, folder);
					if (!fs.existsSync(currentPath)) {
						continue; // Skip if directory does not exist
					}
				}
			}
		};

		deleteFolders(basePath, folderArray);
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

	// Method to create a basic file
	createBasicFile(filePath) {
		this.ensurePathExists(path.dirname(filePath));
		fs.writeFileSync(filePath, "");
		const key = path.basename(filePath);
		this.files[key] = filePath;
		return key;
	}

	// Modification for createLogFile method in FileManager class

	createLogFile(directoryPath, mode = "date", incrementFlag = false) {
		this.ensurePathExists(directoryPath);

		let finalPath;
		if (mode === "date") {
			// Date Mode: File with today's date
			const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
			finalPath = path.join(directoryPath, `log_${date}.txt`);
		} else if (mode === "increment") {
			// Increment Mode: File with incremented number
			const existingFiles = fs
				.readdirSync(directoryPath)
				.filter((file) => file.startsWith("log_") && file.endsWith(".txt"))
				.map((file) => parseInt(file.match(/log_(\d+)\.txt/)[1], 10))
				.filter((num) => !isNaN(num))
				.sort((a, b) => a - b);

			let latestIndex = existingFiles.length ? existingFiles[existingFiles.length - 1] : incrementFlag ? -1 : 0;
			if (incrementFlag) {
				latestIndex += 1; // Create new incremented file
			}
			finalPath = path.join(directoryPath, `log_${latestIndex}.txt`);
		} else {
			throw new Error("Invalid mode specified. Use 'date' or 'increment'.");
		}

		// Ensure the file exists (append mode for existing logs)
		fs.writeFileSync(finalPath, "", { flag: "a" });
		const key = path.basename(finalPath);
		this.files[key] = finalPath;
		return key;
	}

	// Method to create a temporary file
	createTempFile(filePath) {
		this.ensurePathExists(path.dirname(filePath));
		const tempKey = "temp_" + path.basename(filePath); // Add "temp_" prefix for consistent temp identification
		const tempPath = path.join(path.dirname(filePath), tempKey);

		fs.writeFileSync(tempPath, "");
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
	writeToFile(key, data, pretty = true) {
		key = this.resolveKey(key);
		if (this.files[key]) {
			const formattedData = this.formatData(data, pretty);
			fs.writeFileSync(this.files[key], formattedData);
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
	appendToFile(key, data, pretty = true) {
		key = this.resolveKey(key);
		if (this.files[key]) {
			const formattedData = this.formatData(data, pretty);
			fs.appendFileSync(this.files[key], formattedData);
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
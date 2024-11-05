# FileManager

A robust and versatile file and folder manager for Node.js applications. The `FileManager` class provides various functionalities to create, delete, read, write, and manipulate files and directories. This package is designed for developers who need a simple yet powerful way to manage their file systems. Very small and lightweight, it can be easily integrated into any Node.js project.

## Update Notice

The latest version of **filemangernode** has shifted from a class-based to an object-based, global architecture. This update means the package no longer exports a class but instead initializes a **global `fileManager` object** accessible throughout any project module. To utilize this global object, simply `require` the package once in any connected module, and `fileManager` will become available across your application without further imports. 

**Important:** This change introduces `fileManager` to the global namespace, potentially causing conflicts if an existing `fileManager` variable or instance already exists in your project. Before upgrading, check your project for any `fileManager` object instances to prevent naming conflicts. This update enhances accessibility but requires caution, as multiple inclusions or unintentional overrides of `fileManager` may lead to unpredictable behavior.

## Features

- **Create Folder Structures:** Easily create nested folder structures.
- **Delete Folder Structures:** Remove specific folders and their contents.
- **File Operations:** Create, read, write, append, rename, and delete files.
- **Temporary File Management:** Create and manage temporary files efficiently.
- **File Metadata Retrieval:** Get file size, creation date, and modification date.
- **File Search:** Search for files in a directory that match a specific query.
- **File Backup:** Create backups of files with a timestamp.
- **File Compression:** Compress files to `.gz` format for efficient storage.
- **Aliases:** Create aliases for files for easier reference.

## Installation

You can install the `FileManager` package using npm:

```bash
npm install filemanagernode
```

## Usage

To use the `fileManager` object in your application, simply require the package in any connected project module and file manager will be shared across all the project files, no need to pass it around:

```javascript
require("filemanagenode")
```

---

### 1. Creating a Folder Structure

Create a nested folder structure:

```javascript
fileManager.createFolderStructure('/path/to/base', ['folder1', ['folder2', 'folder3']]);
```

### 2. Deleting a Folder Structure

Delete specific folders based on a provided structure:

```javascript
fileManager.deleteFolderStructure('/path/to/base', ['folder1', '*', ['subfolder1']]);
```

### [Know more about Folder Structure Operations Here](./FOLDERAPI.md)

---

### 3. Creating a Basic File

Create a basic file at the specified path and return its key:

```javascript
const fileKey = fileManager.createBasicFile('/path/to/file.txt');
console.log(`Created file with key: ${fileKey}`);
```

### 4. Writing to a File

Write data to a file specified by its key:

```javascript
fileManager.writeToFile(fileKey, 'Hello, world!');
console.log('Data written to file.');
```

### 5. Reading from a File

Read data from a file specified by its key:

```javascript
const data = fileManager.readFile(fileKey);
console.log(`Data read from file: ${data}`);
```

### 6. Appending to a File

Append data to a file specified by its key:

```javascript
fileManager.appendToFile(fileKey, ' Appending this text.');
console.log('Data appended to file.');
```

### 7. Renaming a File

Rename a file:

```javascript
fileManager.renameFile(fileKey, 'newfile.txt');
console.log('File renamed.');
```

### 8. Deleting a File

Delete a file specified by its key:

```javascript
fileManager.deleteFile(fileKey);
console.log('File deleted.');
```

---

### 9a. Creating a Log File

Create a log file in **date mode**. This will create a file named with the current date:

```javascript
const logFileKeyDate = fileManager.createLogFile('/path/to/logs', 'date');
console.log(`Log file created in date mode with key: ${logFileKeyDate}`);
```

Create a log file in **increment mode**. This will create a file with a number as the suffix:

```javascript
const logFileKeyIncr = fileManager.createLogFile('/path/to/logs', 'increment', false);
console.log(`Log file created in date mode with key: ${logFileKeyIncr}`);
```

### 9b. Creating a Temporary File

Create a temporary file and return its key:

```javascript
const tempKey = fileManager.createTempFile('/path/to/tempfile.txt');
console.log(`Created temporary file with key: ${tempKey}`);
```

---

### 10. Adding an Alias

Add an alias for a file:

```javascript
fileManager.addAlias('myLog', fileKey);
console.log('Alias added.');
```

### 11. Resolving an Alias

Resolve an alias to get the original key:

```javascript
const resolvedKey = fileManager.resolveKey('myLog');
console.log(`Resolved key: ${resolvedKey}`);
```

---

### 12. Checking File Existence

Check if a target path exists:

```javascript
const exists = fileManager.exists('/path/to/file.txt');
console.log(`File exists: ${exists}`);
```

### 13. Copying a File

Copy a file from source path to destination path:

```javascript
fileManager.copyFile('/path/to/source.txt', '/path/to/destination.txt');
console.log('File copied.');
```

### 14. Moving a File

Move a file from source path to destination path:

```javascript
fileManager.moveFile('/path/to/source.txt', '/path/to/new/location.txt');
console.log('File moved.');
```

### 15. Retrieving Metadata

Get metadata for a specific file:

```javascript
const metadata = fileManager.getMetadata('/path/to/file.txt');
console.log('File metadata:', metadata);
```

### 16. Searching for Files

Search for files in a directory that match a specific query:

```javascript
const results = fileManager.search('/path/to/directory', 'searchTerm');
console.log('Search results:', results);
```

### 17. Backing Up a File

Backup a file by creating a copy with a timestamp:

```javascript
const backupPath = fileManager.backupFile('/path/to/file.txt');
console.log(`Backup created at: ${backupPath}`);
```

### 18. Compressing a File

Compress a file and save it as `.gz`:

```javascript
fileManager.compressFile('/path/to/file.txt', '/path/to/file.txt.gz')
  .then((compressedPath) => {
    console.log(`File compressed to: ${compressedPath}`);
  })
  .catch((err) => {
    console.error('Error compressing file:', err);
  });
```

---

### 19. Clearing Temporary Files

Temporary files are automatically cleared on program exit, but you can manually call the method:

```javascript
fileManager.clearTempFiles();
console.log('Temporary files cleared.');
```

### 20. Deleting a Directory

Delete a directory and all its contents:

```javascript
fileManager.deleteDirectory('/path/to/directory');
console.log('Directory deleted.');
```

### 21. Ensuring Path Exists

Ensure a specific path exists (create if it does not):

```javascript
fileManager.ensurePathExists('/path/to/directory');
console.log('Path ensured to exist.');
```

### 22. Getting All Managed Files

Retrieve all files managed by the `FileManager`:

```javascript
console.log('All managed files:', fileManager.files);
```

## API Reference


### `fileManager`

The `fileManager` object provides methods for managing files and directories within a Node.js environment.

#### Data Members

- **`files`**: An object that stores file paths, using the file name as the key.
- **`tempFiles`**: A Set that tracks temporary files created by the `FileManager`.
- **`aliases`**: An object that maps aliases to their original file keys for easy resolution.

#### Methods

1. **`constructor()`**
   - Initializes a new instance of the `FileManager`. Sets up data members and attaches an exit event listener to clean up temporary files.

2. **`createFolderStructure(basePath, folderArray)`**
   - Creates a nested folder structure based on the provided array.
   - **Parameters**:
     - `basePath` (string): The root path where the folder structure should be created.
     - `folderArray` (Array): An array defining the folder structure, which can include nested arrays.

3. **`deleteFolderStructure(basePath, folderArray)`**
   - Deletes specified folders and their contents based on the provided structure.
   - **Parameters**:
     - `basePath` (string): The root path where the folders are located.
     - `folderArray` (Array): An array defining the folder structure to delete.

4. **`deleteDirectory(dirPath)`**
   - Helper function to delete a directory and all its contents.
   - **Parameters**:
     - `dirPath` (string): The path of the directory to be deleted.

5. **`createBasicFile(filePath)`**
   - Creates a basic file at the specified path.
   - **Parameters**:
     - `filePath` (string): The path where the file should be created.
   - **Returns**: A key (string) representing the file.

6. **`createLogFile(directoryPath, mode = "date", incrementFlag = false)`**
   - Creates a log file in the specified directory, with options for naming based on date or increment.
   - **Parameters**:
     - `directoryPath` (string): The path where the log file should be created.
     - `mode` (string): The naming mode for the log file, either "date" or "increment".
     - `incrementFlag` (boolean): Whether to create a new incremented log file if mode is "increment".
   - **Returns**: A key (string) representing the log file.

7. **`createTempFile(filePath)`**
   - Creates a temporary file with a prefixed name for identification.
   - **Parameters**:
     - `filePath` (string): The path for the temporary file.
   - **Returns**: A key (string) for the temporary file.

8. **`addAlias(alias, originalKey)`**
   - Adds an alias for an original file key.
   - **Parameters**:
     - `alias` (string): The alias name to be added.
     - `originalKey` (string): The original file key associated with the alias.
   - **Throws**: An error if the original key does not exist or if the alias conflicts with existing keys.

9. **`resolveKey(key)`**
   - Resolves an alias to its original key.
   - **Parameters**:
     - `key` (string): The key or alias to be resolved.
   - **Returns**: The resolved original key (string).

10. **`writeToFile(key, data)`**
    - Writes data to a file identified by the provided key.
    - Writes json data to a file in pretty format by default.
    - **Parameters**:
      - `key` (string): The key representing the file.
      - `data` (string): The data to be written to the file.
      - `pretty` (boolean): By default true, if false, object (json) data will be written as it is.
    - **Throws**: An error if the file is not found.

11. **`readFile(key)`**
    - Reads data from a file identified by the provided key.
    - **Parameters**:
      - `key` (string): The key representing the file.
    - **Returns**: The content of the file (string).
    - **Throws**: An error if the file is not found.

12. **`appendToFile(key, data)`**
    - Appends data to a file identified by the provided key.
    - Appends json data to a file in pretty format by default.
    - **Parameters**:
      - `key` (string): The key representing the file.
      - `data` (string): The data to be appended to the file.
      - `pretty` (boolean): By default true, if false, object (json) data will be appended as it is.
    - **Throws**: An error if the file is not found.

13. **`renameFile(oldKey, newName)`**
    - Renames a file from an old key to a new name.
    - **Parameters**:
      - `oldKey` (string): The original key of the file.
      - `newName` (string): The new name for the file.
    - **Throws**: An error if the file is not found.

14. **`deleteFile(key)`**
    - Deletes a file identified by the provided key.
    - **Parameters**:
      - `key` (string): The key representing the file.
    - **Throws**: An error if the file is not found or has already been deleted.

15. **`ensurePathExists(fullPath)`**
    - Checks if a given path exists; creates it if not.
    - **Parameters**:
      - `fullPath` (string): The path to be checked or created.

16. **`clearTempFiles()`**
    - Deletes all temporary files created by the `FileManager` upon program exit.

17. **`exists(targetPath)`**
    - Checks if a specified path exists.
    - **Parameters**:
      - `targetPath` (string): The path to check.
    - **Returns**: A boolean indicating the existence of the path.

18. **`copyFile(srcPath, destPath)`**
    - Copies a file from the source path to the destination path.
    - **Parameters**:
      - `srcPath` (string): The source file path.
      - `destPath` (string): The destination file path.
    - **Returns**: A key (string) representing the copied file.

19. **`moveFile(srcPath, destPath)`**
    - Moves a file from the source path to the destination path.
    - **Parameters**:
      - `srcPath` (string): The source file path.
      - `destPath` (string): The destination file path.
    - **Returns**: A key (string) representing the moved file.

20. **`getMetadata(filePath)`**
    - Retrieves metadata for a specified file.
    - **Parameters**:
      - `filePath` (string): The path of the file.
    - **Returns**: An object containing the file's size, creation date, modification date, and type (directory or file).
    - **Throws**: An error if the file does not exist.

21. **`search(directoryPath, query)`**
    - Searches for files in a specified directory that match a given query.
    - **Parameters**:
      - `directoryPath` (string): The path of the directory to search in.
      - `query` (string): The query string to match against file names.
    - **Returns**: An array of matching file paths.
    - **Throws**: An error if the directory does not exist.

22. **`backupFile(filePath)`**
    - Creates a backup of a specified file by copying it with a timestamped name.
    - **Parameters**:
      - `filePath` (string): The path of the file to be backed up.
    - **Returns**: The path of the backup file.
    - **Throws**: An error if the file does not exist.

23. **`compressFile(filePath, destPath)`**
    - Compresses a specified file and saves it as a `.gz` file.
    - **Parameters**:
      - `filePath` (string): The path of the file to be compressed.
      - `destPath` (string): The destination path for the compressed file.
    - **Returns**: A promise that resolves to the path of the compressed file.
    - **Throws**: An error if the file does not exist.

---

### [Learn Use Case Scenarios For This Class](./USECASES.md)

---

## Contributing

Contributions are welcome! If you find any bugs or have feature requests, feel free to open an issue or submit a pull request. [Github](https://github.com/PBJI/FileManagerNode)

## License

This project is licensed under the ISC License
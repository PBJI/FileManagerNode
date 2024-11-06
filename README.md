# FileManager

A robust and versatile file and folder manager for Node.js applications. The `FileManager` class provides various functionalities to create, delete, read, write, and manipulate files and directories. This package is designed for developers who need a simple yet powerful way to manage their file systems. Very small and lightweight, it can be easily integrated into any Node.js project.

## Update Notice

- v3.2 Update: This release enhances folder structure management, providing full and bug-free support for creating and deleting complex structures. Additionally, it refines file path handling, ensuring paths are resolved relative to the calling module rather than the project root. This change enables reliable file operations in deeply nested modules, improving flexibility and accuracy in file path resolution.

- v3.0 Update: In this release, **filemangernode** has shifted from a class-based to an object-based, global architecture. This update means the package no longer exports a class but instead initializes a **global `fileManager` object** accessible throughout any project module. To utilize this global object, simply `require` the package once in any connected module, and `fileManager` will become available across your application without further imports. **Important:** This change introduces `fileManager` to the global namespace, potentially causing conflicts if an existing `fileManager` variable or instance already exists in your project. Before upgrading, check your project for any `fileManager` object instances to prevent naming conflicts. This update enhances accessibility but requires caution, as multiple inclusions or unintentional overrides of `fileManager` may lead to unpredictable behavior.

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

To create a nested folder structure:

```javascript
fileManager.createFolderStructure('/path/to/base', ['folder1', ['folder2', 'folder3']]);
```

This will create the following folders:
- `folder1`
  - `folder2` (inside `folder1`)
  - `folder3` (inside `folder1`)

**Explanation:** Specify the parent folder followed by an array of child folders. Nested structures are created by specifying the parent folder first, with each subsequent array representing folders inside it.

### 2. Deleting a Folder Structure

To delete specific folders based on a defined structure:

```javascript
fileManager.deleteFolderStructure('/path/to/base', ['folder1', 'folder2', ['subfolder1'], 'folder3', ['subfolder1', ['subsubfolder1']]]);
```

This will delete the following folders:
- `folder1`
- `subfolder1` inside `folder2`
- `subsubfolder1` inside `subfolder1` inside `folder3`

**Explanation:** Only the specified folders will be deleted. Parent folders remain intact unless explicitly specified. This ensures precise folder deletion without affecting the overall structure.

**Takeaway:** When defining the folder structure, list the parent folder followed by an array of child folders. Specifying a nested structure will delete only the specified child folders, not their parent folders.

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

### 9. Creating a Log File

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

### 10. Creating a Temporary File

Create a temporary file and return its key, temporary files are special because they get automatically deleted after the program exits:

```javascript
const tempKey = fileManager.createTempFile('/path/to/tempfile.txt');
console.log(`Created temporary file with key: ${tempKey}`);
```

---

### 11. Adding an Alias

Add an alias for a file:

```javascript
fileManager.addAlias('myLog', fileKey);
console.log('Alias added.');
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

### 21. Getting All Managed Files

Retrieve all files managed by the `FileManager`:

```javascript
console.log('All managed files:', fileManager.files);
```

---

## API Reference


### `fileManager`

The `fileManager` object provides methods for managing files and directories within a Node.js environment.

#### Data Members

- **`files`**: An object that stores file paths, using the file name as the key.
- **`tempFiles`**: A Set that tracks temporary files created by the `FileManager`.
- **`aliases`**: An object that maps aliases to their original file keys for easy resolution.

#### Methods

1. **`createFolderStructure(basePath, folderArray)`**
   - Creates a nested folder structure based on the provided array.
   - **Parameters**:
     - `basePath` (string): The root path where the folder structure should be created.
     - `folderArray` (Array): An array defining the folder structure, which can include nested arrays.

2. **`deleteFolderStructure(basePath, folderArray, mode)`**
   - Deletes specified folders and their contents based on the provided structure.
   - **Parameters**:
     - `basePath` (string): The root path where the folders are located.
     - `folderArray` (Array): An array defining the folder structure to delete.
     - `mode` (string): The deletion mode, either "preserve" or "force".
    - **Mode Options**:
      - "preserve": Deletes only the specified folders, also if empty.
      - "force": Deletes the specified folders and their contents.

3. **`deleteDirectory(dirPath)`**
   - Helper function to delete a directory and all its contents.
   - **Parameters**:
     - `dirPath` (string): The path of the directory to be deleted.

4. **`createBasicFile(filePath, fileMode)`**
   - Creates a basic file at the specified path.
   - **Parameters**:
     - `filePath` (string): The path where the file should be created.
     - `fileMode` (string): The mode in which to create the file, "preserve", "overwrite" or "unique"
   - **Filemode Options**:
     - "preserve": If the file already exists, it will not be overwritten.
     - "overwrite": If the file already exists, it will be overwritten.
     - "unique": If the file already exists, a numeric suffix will be added to create a unique file.
   - **Returns**: A key (string) representing the file.

5. **`createLogFile(directoryPath, namingMode = "date", fileMode = "reuse")`**
   - Creates a log file in the specified directory, with options for naming based on date or increment.
   - **Parameters**:
     - `directoryPath` (string): The path where the log file should be created.
     - `namingMode` (string): The naming mode for the log file, either "date" or "increment".
     - `fileMode` (string): The mode in which to create the file, "preserve", "overwrite" or "unique"
   - **Filemode Options**:
     - "preserve": If the file already exists, it will not be overwritten.
     - "overwrite": If the file already exists, it will be overwritten.
     - "unique": If the file already exists, a numeric suffix will be added to create a unique file.
   - **Returns**: A key (string) representing the log file.

6. **`createTempFile(filePath, fileMode)`**
   - Creates a temporary file with a prefixed name for identification.
   - **Parameters**:
     - `filePath` (string): The path for the temporary file.
   - **Filemode Options**:
     - "preserve": If the file already exists, it will not be overwritten.
     - "overwrite": If the file already exists, it will be overwritten.
     - "unique": If the file already exists, a numeric suffix will be added to create a unique file.
   - **Returns**: A key (string) for the temporary file.

7. **`addAlias(alias, originalKey)`**
   - Adds an alias for an original file key.
   - **Parameters**:
     - `alias` (string): The alias name to be added.
     - `originalKey` (string): The original file key associated with the alias.
   - **Throws**: An error if the original key does not exist or if the alias conflicts with existing keys.

8. **`resolveKey(key)`**
   - Resolves an alias to its original key.
   - **Parameters**:
     - `key` (string): The key or alias to be resolved.
   - **Returns**: The resolved original key (string).

9. **`writeToFile(key, data)`**
    - Writes data to a file identified by the provided key.
    - Writes json data to a file in pretty format by default.
    - **Parameters**:
      - `key` (string): The key representing the file.
      - `data` (string): The data to be written to the file.
      - `pretty` (boolean): By default true, if false, object (json) data will be written as it is.
    - **Throws**: An error if the file is not found.

10. **`readFile(key)`**
    - Reads data from a file identified by the provided key.
    - **Parameters**:
      - `key` (string): The key representing the file.
    - **Returns**: The content of the file (string).
    - **Throws**: An error if the file is not found.

11. **`appendToFile(key, data)`**
    - Appends data to a file identified by the provided key.
    - Appends json data to a file in pretty format by default.
    - **Parameters**:
      - `key` (string): The key representing the file.
      - `data` (string): The data to be appended to the file.
      - `pretty` (boolean): By default true, if false, object (json) data will be appended as it is.
    - **Throws**: An error if the file is not found.

12. **`renameFile(oldKey, newName)`**
    - Renames a file from an old key to a new name.
    - **Parameters**:
      - `oldKey` (string): The original key of the file.
      - `newName` (string): The new name for the file.
    - **Throws**: An error if the file is not found.

13. **`deleteFile(key)`**
    - Deletes a file identified by the provided key.
    - **Parameters**:
      - `key` (string): The key representing the file.
    - **Throws**: An error if the file is not found or has already been deleted.

14. **`ensurePathExists(fullPath)`**
    - Checks if a given path exists; creates it if not.
    - **Parameters**:
      - `fullPath` (string): The path to be checked or created.

15. **`clearTempFiles()`**
    - Deletes all temporary files created by the `FileManager` upon program exit.

16. **`exists(targetPath)`**
    - Checks if a specified path exists.
    - **Parameters**:
      - `targetPath` (string): The path to check.
    - **Returns**: A boolean indicating the existence of the path.

17. **`copyFile(srcPath, destPath)`**
    - Copies a file from the source path to the destination path.
    - **Parameters**:
      - `srcPath` (string): The source file path.
      - `destPath` (string): The destination file path.
    - **Returns**: A key (string) representing the copied file.

18. **`moveFile(srcPath, destPath)`**
    - Moves a file from the source path to the destination path.
    - **Parameters**:
      - `srcPath` (string): The source file path.
      - `destPath` (string): The destination file path.
    - **Returns**: A key (string) representing the moved file.

19. **`getMetadata(filePath)`**
    - Retrieves metadata for a specified file.
    - **Parameters**:
      - `filePath` (string): The path of the file.
    - **Returns**: An object containing the file's size, creation date, modification date, and type (directory or file).
    - **Throws**: An error if the file does not exist.

20. **`search(directoryPath, query)`**
    - Searches for files in a specified directory that match a given query.
    - **Parameters**:
      - `directoryPath` (string): The path of the directory to search in.
      - `query` (string): The query string to match against file names.
    - **Returns**: An array of matching file paths.
    - **Throws**: An error if the directory does not exist.

21. **`backupFile(filePath)`**
    - Creates a backup of a specified file by copying it with a timestamped name.
    - **Parameters**:
      - `filePath` (string): The path of the file to be backed up.
    - **Returns**: The path of the backup file.
    - **Throws**: An error if the file does not exist.

22. **`compressFile(filePath, destPath)`**
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
-- Tabla: module
CREATE TABLE `module` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(30) NOT NULL,
  `description` VARCHAR(255),
  `path` VARCHAR(255),
  `parentId` INT,
  FOREIGN KEY (`parentId`) REFERENCES `module`(`id`) ON DELETE SET NULL
);

-- Tabla: action
CREATE TABLE `action` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `moduleId` INT NOT NULL,
  `action` ENUM('READ', 'WRITE', 'DELETE') NOT NULL,
  FOREIGN KEY (`moduleId`) REFERENCES `module`(`id`) ON DELETE CASCADE
);

-- Tabla: rol
CREATE TABLE `rol` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(30) NOT NULL,
  `status` BOOLEAN NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla: permissions
CREATE TABLE `permissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `rolId` INT NOT NULL,
  `actionId` INT NOT NULL,
  FOREIGN KEY (`rolId`) REFERENCES `rol`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`actionId`) REFERENCES `action`(`id`) ON DELETE CASCADE
);

-- Tabla: users
CREATE TABLE `users` (
  `id` CHAR(36) PRIMARY KEY, -- UUID
  `rolId` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `lastName` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `status` BOOLEAN NOT NULL,
  `verifyAccount` BOOLEAN NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`rolId`) REFERENCES `rol`(`id`) ON DELETE CASCADE
);


CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_permission_rol ON permissions(rolId);
CREATE INDEX idx_permission_action ON permissions(actionId);
CREATE INDEX idx_module_parent ON module(parentId);
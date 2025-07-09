-- Create Break model for event scheduling breaks
CREATE TABLE break (
    id TEXT PRIMARY KEY,
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    reason TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

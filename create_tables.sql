-- Create worklets table
CREATE TABLE IF NOT EXISTS worklets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cert_id VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status_id INT,
    status VARCHAR(50),
    year INT NOT NULL DEFAULT (YEAR(CURRENT_TIMESTAMP)),
    team VARCHAR(100),
    mentors TEXT,
    professors TEXT,
    students TEXT,
    college VARCHAR(150) NOT NULL,
    git_path VARCHAR(255),
    created_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    risk_status INT,
    performance_status INT,
    percentage_completion INT,
    problem_statement TEXT,
    expectations TEXT,
    prerequisites TEXT,
    milestone_id INT
);

-- Create user_worklet_association table
CREATE TABLE IF NOT EXISTS user_worklet_association (
    user_id INT,
    worklet_id INT,
    PRIMARY KEY (user_id, worklet_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (worklet_id) REFERENCES worklets(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS ix_worklet_cert_id ON worklets(cert_id);
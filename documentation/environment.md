# The Environment Files

> Note: Most environment files are being phased out due to the amount of files needed. They will be replaced with a more manageable solution in the future. This does not mean that environment files will be removed entirely, just reduced in number.

To run a development environment you will need to create the necessary environment files. The list below shows the files required and their contents.

## Files

- .env.migration.mongo

> Environment files should not be tracked in versions control.

## File Contents

### .env.migration.mongo

| Filename             | Key                     | Description           |
| -------------------- | ----------------------- | --------------------- |
| .env.migration.mongo | MONGO_DATABASE_USERNAME | MongoDB username      |
| .env.migration.mongo | MONGO_DATABASE_PASSWORD | MongoDB password      |
| .env.migration.mongo | MONGO_DATABASE_HOST     | MongoDB database host |
| .env.migration.mongo | MONGO_DATABASE_PORT     | MongoDB database port |

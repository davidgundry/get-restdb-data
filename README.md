# get-restdb-data

Script to download and optionally delete all data from a [restdb.io](https://restdb.io) database collection.

## Instalation

Clone the repository and then run `npm install`.

## Usage

Call the script passing the database collection url, the API key and an output filename. 

Pass the `-d` flag as the first argument to delete records that have been retrieved.

`get-restdb-data -d https://<your-database>.restdb.io/rest/<your-collection> <API-KEY> output.json`
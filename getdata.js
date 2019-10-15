#!/usr/bin/env node

/**
 * Script to download and optionally delete all data from a restdb.io database collection.
 * Pass the `-d` flag as the first argument to delete records that have been retrieved.
 * Usage example:
 *     node getdata.js -d https://<your-database>.restdb.io/rest/<your-collection> <API-KEY> output.json
 */

const requestPromise = require("request-promise");
const fs = require('fs');
const validUrl = require('valid-url');

function saveData(url, filename, apiKey, deleteRecords)
{
    if (url.slice(-1) === "/")
        url = url.substring(0,url.length-1)
    requestPromise({
        method: 'GET',
        url: url,
        headers: 
        {
            'cache-control': 'no-cache',
            'x-apikey': apiKey
        }})
        .then((body) =>
        {
            let json = JSON.parse(body);
            let ids = [];
            json.forEach(x => ids.push(x._id));
            console.log(ids.length + " records retrieved." + ((ids.length === 0) ? " No file written" : ""));

            if (ids.length > 0)
                fs.writeFile(filename, body, function(err) {
                    if(err)
                        return console.error(err);
                }); 
            if (deleteRecords)
                return requestPromise({
                    method: 'DELETE',
                    url: url+"/*",
                    headers: 
                    { 
                        'cache-control': 'no-cache',
                        'x-apikey': apiKey,
                        'content-type': 'application/json'
                    },
                    body: ids,
                    json: true });
        })
        .then((body) =>
        {
            if (body)
            {
                let ids = [];
                body.result.forEach(x => ids.push(x));
                console.log(ids.length + " records deleted.");
            }
        })
        .catch((err) =>
        {
            console.error(err)
        });
}


var args = process.argv.slice(2);
if (args.length === 0) 
    console.log("get-restdb-data: A script to download and optionally delete all data from a restdb.io database collection.\nSpecify a filename and an optional initial -d flag to delete fetched records.\nUsage example: \n    get-restdb-data -d https://<your-database>.restdb.io/rest/<your-collection> <API-KEY> output.json");
else if ((args.length > 4) || (args.length < 3))
{
    console.log("Incorrect number of arguments: " + args.length);
    console.log("get-restdb-data: A script to download and optionally delete all data from a restdb.io database collection.\nSpecify a filename and an optional initial -d flag to delete fetched records.\nUsage example: \n    get-restdb-data -d https://<your-database>.restdb.io/rest/<your-collection> <API-KEY> output.json");
}
else
{
    let deleteRecords = false;
    let filepath = "";
    let key = "";
    let url = "";

    if (args[0] === '-d')
    {
        deleteRecords = true;
        url = args[1];
        key = args[2];
        filepath = args[3];
    }
    else
    {
        url = args[0];
        key = args[1];
        filepath = args[2];
    }

    if (validUrl.isUri(url))
        saveData(url,
                filepath,
                key,
                deleteRecords)
    else
        console.log("Cannot retrieve data: Database collection URL: `" + url + "` appears to be invalid.");
}
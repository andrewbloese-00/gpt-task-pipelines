# GPT-Task Pipelines
Some GPT Task Automations implemented with Node JS. I will be adding some documentation soon.

A basic overview of current task piplines[v 0.0.0]
* Create text-with-embedding array from single text file
* Create text-with-embedding array from text in files in specified directory
* insert generated embeddings for existing json data or js objects
* query embedding items with a string to get top 10 most relevant matchings from your supplied data array.
* 🛠️ MongoDB connections such as collection creation from text files, embedding existing collections, and more coming soon!
* 🔭 In the future looking to integrate these technologies with other popular db providers and implemetations such as postgresql , firebase firestore and supabase. 


## Usage

### Utilities
The utils' functions are used within the different pipelines, however they are made available to consumers of this library throught the 'utils' object.
``` javascript
//bring in utilities
const { utils } = require("gpt-task-pipelines")

//chunk text into chunks of 100 tokens
let longText = "Some long string..."
let chunked = utils.chunkText(longText,100)

//count number of tokens
let tokenCount = utils.countTokens(longText)

//get embedding for the text - must speficy openai api key in a config.json file in root directory
let { embedding, error } = await utils.getEmbedding(longText)

```

### Pipelines

#### Embed Array
The array of objects to calculate embeddings for is directly modified by appending the field 'embedding' on each element of the array. Each element of the array must have a text field (eg. for x of array x.text != undefined). 
```javascript
const { pipelines } = require("gpt-task-pipelines");
let exampleData = [
	{text: "hello there"},
	{text: "this is a test"},
	{text: "goodbye"},
]


pipelines.embedArray(exampleData)
console.log(exampleData)// see the changed array will have structure similar to below
/* example data example
[
	{text: "hello there", embedding: {v:number[], m:number}},
	{text: "this is a test", embedding: {v:number[], m:number}},
	{text: "goodbye", embedding: {v:number[], m:number}},
	
]

*/

```


#### Embed JSON
This function is used to create embeddings similarly to 'embedArray' but it acts on a valid JSON string containing an array of objects containing 'text' fields. The second parameter is the filename to output the resulting json to. 
```javascript
const { pipelines } = require("gpt-task-pipelines")
const jsonString = JSON.stringify([
{ text: "this is a test", otherAttrib: "a"} 
])

//embed json 
const embeddedDataArray = await pipelines.embedJSON(jsonString,"output.json")
/* output.json and embedded data array will look as below:
[
	{ 
		"text": "this is a test", 
		"otherAttrib": "a", 
		"embedding": { v: number[], m: number}
	}
]

*/

```


#### Embed Text File(s)

There are pipelines in place to assist in transforming raw text data into embedded items. The embedTextFile is great for single file reads, and getFolderEmbeddings will read all the text in a given directory. 

```javascript

const {pipelines} = require("gpt-task-pipelines")
//individual text file 
//recommended 100-200 tokens per chunk.
const pathToFile = "path/to/text/file", tokensPerChunk = 150 
const {misses, chunks } = await pipelines.embedTextFile(pathToFile,tokenPerChunk);
//misses is an array containing the errors (if any) encountered during the embed process
//chunks will have the same format as the example in 'embedArray'


const pathToFolderOfFiles = "path/to/folder", tokensPerChunk =150
const {misses, chunks} = await pipelines.getFolderEmbeddings(patToFolderOfFiles,tokenPerChunk);
//same output format as embedTextFile


```

#### [EXPERIMENTAL NOT TESTED] Embed a mongodb collection
Still testing / developing. Will allow client to input their connection-string for mongodb, along with the name of the collection to embed. The algorithm will then generate embeddings and update each document in the collection with the 'text' field present.
```javascript

const {pipelines} = require("gpt-task-pipelines")

//specify parameters
const collectionName="notes";
const connectionString = "your_connection_string";
const args = [connectionString,collectionName];

//embed valid items in collection, catch error in the 'error' variable
const {data,error} = await pipelines.embedMongoDBCollection(...args);

```


#### [EXPERIMENTAL NOT TESTED] MongoDB Collection From Folder Of Files
Still testing / developing. Will allow client to input their connection string for mongodb, along with the name of the collection to insert to or create. The algorithm will then aquire chunked text with embeddings and insert them as documents into the speficied collection. If the collection is not existing prior to this function, it will be created automatically. 

```javascript
const {pipelines} = require("gpt-task-pipelines")

//specify parameters
const connectionString = "your-connection-string",
collectionName="notes",
pathToFolderOfFiles="/some/path/to/folder";
const args = [connectionString,collectionName,pathToFolderOfFiles];

//insert items into specified collection, catch error in the 'error' variable
const { data , error } = await pipelines.mongoCollectionFromFolder(...args);

```
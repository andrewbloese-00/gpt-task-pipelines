# GPT-Task Pipelines
Some GPT Task Automations implemented with Node JS. 


**A basic overview of current task piplines [v0.0.0]**
* Create text-with-embedding array from single text file
* Create text-with-embedding array from text in files in specified directory
* insert generated embeddings for existing json data or js objects
* query embedding items with a string to get top 10 most relevant matchings from your supplied data array.
* MongoDB connections such as collection creation from text files, embedding existing collections, and more coming soon!
* 🔭 In the future looking to integrate these technologies with other popular db providers and implemetations such as postgresql , firebase firestore and supabase. 



****
## Testing
The test.js file contains a test cases for each of the different pipelines with an interactive test interface. Simply input the test number to run and view the output realtime, as well as get an idea of how long each pipeline / utility function may take to run. Once a more finalized version is established I will outline the test cases here. 

****



****
## Installation
Currently this project requires a download of the repository currently. However I will be releasing as an npm package as soon as I reach a more stable implementation. For those who downloaded the project replace the 'require("gpt-task-pipelines")' in the documentation  to require('path/to/repository/index.js)
****
## Usage
There are a handful of utilities and pipelines available to help make working with gpt in node.js more accessible to developers. 
All available functions are documented below and with JSDoc. 

****
### Utilities
The utils' functions are used within the different pipelines, however they are also made available to consumers of this library throught the 'utils' object.


#### chunkText
Useful for splitting large blocks of text into smaller blocks. Prevent surpassing token limits by chunking your text. 
**Parameters** 
> text:string
the text to be split into chunks

> tokensPerChunk:number
the max number of text tokens to be present in each 'chunk' of text

**Returns**
An array of strings (string[]) representing chunks of roughly the 'tokensPerChunk' tokens. 


#### countTokens
Get the number of tokens present in a string. Helpful for estimating cost and managing rate limits for the OpenAI API. 
Note: Each token is roughly 4 characters. 

**Parameters**
> text: string
the text to get the number of tokens in


**Returns**
> numTokens:number
The number of tokens present in the provided string


#### getEmbedding 
Use the text-embedding-ada-002 model to generate embedding for provided text. Requires config.json to be present with 'OPENAI_KEY'. 
See config.example.json for more information on setup. 

**Parameters** 
> text : string 
The text to get the embedding vector for


**Returns**
* A Promise resolving with either {data} or {error}, with {data} containing a 'smartVector' containing both the embedding vector itself & its magnitude.
* NOTE: see [embedding-search-node](https://github.com/andrewbloese-00/embedding-search-node) repo for more information about the 'smartVector' format. 

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
****
### Pipelines
#### Embed Array
The array of objects to calculate embeddings for is directly modified by appending the field 'embedding' on each element of the array. Each element of the array must have a text field (eg. for x of array x.text != undefined). 

**Parameters**
> dataArray: array of objects to embed the 'text' field of. 

**Returns**
> void -> the passed 'dataArray' is mutated, and will contain 'embedding' field on valid array entries.


```javascript
const { pipelines } = require("gpt-task-pipelines");

//define or fetch a dataArray
let exampleData = [
	{text: "hello there"},
	{text: "this is a test"},
	{text: "goodbye"},
]

pipelines.embedArray(exampleData)

//see Example Result for more detail
console.log(exampleData)
```


**Example Result**
The dataArray will be transformed into a result similar to below. Note if your entries have more fields than "text" they will be preserved in the result array as well. 
```json
[
	{
		"text":"hello there",
	 	"embedding": { 
			"v": [], //some embedding vector | number[]
			"m": 0.99 //the magnitude of the vector 
		}
	},
	{
		"text":"this is a test",
	 	"embedding": { 
			"v": [], //some embedding vector | number[]
			"m": 0.99 //the magnitude of the vector 
		}
	},
	{
		"text":"goodbye",
	 	"embedding": { 
			"v": [], //some embedding vector | number[]
			"m": 0.99 //the magnitude of the vector 
		}
	},
]

```

#### Embed JSON
This function is used to create embeddings similarly to 'embedArray' but it acts on a valid JSON string containing an array of objects containing 'text' fields. Returns the new json string as well as writes to specified output file 


**Parameters**
> jsonString:string -> a raw JSON string of a dataArray. 

> filename:string -> the path to the output file to write the resulting JSON string. 

**Returns**
The updated JSON string containing embedding information. See the example for 'embedArray' for more details. 



```javascript
const { pipelines } = require("gpt-task-pipelines")
const jsonString = JSON.stringify([
{ text: "this is a test", otherAttrib: "a"} 
])

//embed json 
const embeddedDataArray = await pipelines.embedJSON(jsonString,"output.json")
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

**Parameters**
> connectionString : string -> the mongodb connection string to access your atlas database. 

> collectionName : string -> the name of the collection to generate embeddings for

**Returns**
A promise containing either 'data' or 'error' to distinguish between success and failures. All found documents with a 'text' field present will be updated with their embedding in the database. 

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

**Parameters**
> connectionString : string 
 the mongodb connection string to access your atlas database. 

> collectionName : string 
the name of the collection to add to or create. 

> pathToFolder : string 
 the path to the folder on your system containing the desired text files. 

**Example**

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

****
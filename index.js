/**
 * The program test a chosen pipeline against the mongo database
 * Results and explain plan of the pipeline are writtent in output json files.
 *
 * The program should be execute with a signle argument, the pipeline name, among:
 * - match: a pipeline with a unique $match state
 * - set: a pipeline with a unique $set state
 * - unset: a pipeline with a unique $unset state
 * - project: a pipeline with a unique $project state
 * - group: a pipeline with a unique $group state
 * - sort: a pipeline with a unique $sort state
 * - limit: a pipeline with a unique $limit state
 * - fullPipeline: the full pipeline from the course
 */
const process = require('process');
const { constants } = require('fs');
const { writeFile, mkdir, access } = require('fs/promises');
const { MongoClient } = require('mongodb');
const basicSamples = require('./exemples/basicSamples');
const fullPipelines= require('./exemples/fullPipelines');

/*
Mongo database information
 */
const MONGO_INFO = {
  host: 'localhost',
  port: 27017,
  database: 'sampledb',
  username: 'mongouser',
  password: 'ajdshfez2sd',
  authdb: 'admin',
};
const MONGO_URI = `mongodb://${MONGO_INFO.username}:${MONGO_INFO.password}@${MONGO_INFO.host}:${MONGO_INFO.port}/${MONGO_INFO.authdb}?retryWrites=true`;
const SALES_COLLECTION = 'sales'; // collection to agregate

/**
 * Print a nice title in the console
 * @param  {String} title the title
 * @return {void}         nothing
 */
function printTitle(title) {
  title = title || 'title';
  const decoration = '-'.repeat(5);
  console.log(`\n${decoration} ${title.toUpperCase()} ${decoration}\n`);
}

/**
 * Write asynchronously some results in a json file
 * @param  {String} ouputFileDir  the output file directory path
 * @param  {String} fileName      the file name, with the .json extension
 * @param  {Array|Object} results results to write into the json file
 * @return {Promise<void>}        a promise
 */
async function writeJsonRes(ouputFileDir, fileName, results) {
  const filePath = results.length || results.length === 0
    ? `${ouputFileDir}/${fileName}_${results.length}.json`
    : `${ouputFileDir}/${fileName}.json`;
  const content = JSON.stringify(results, null, 2);
  return writeFile(filePath, content, { encoding: 'utf8' });
}

/**
 * given a pipeline generator function, connect to mongo create a pipeline, execute it against
 * the database MONGO_COL collection and save the explain plan and resluts in two different json files
 * @param  {function} pipelineGenerator the pipeline generator
 * @return {Promise<void>}              a promise
 */
async function testPipeline(pipelineGenerator, ouputFileDir) {
  const client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
  try {
    // Connect to Mongo
    await client.connect();
    // Select the database and the colleciton
    const collection = client.db(MONGO_INFO.database).collection(SALES_COLLECTION);
    // Build the pipeline
    const pipeline = pipelineGenerator();
    // Print title and pipeline description
    printTitle('pipeline');
    console.log(JSON.stringify(pipeline, null, 2))
    printTitle('end pipeline');
    printTitle('Start test');
    // Produce and explanation plan (do not execute the pipeline)
    console.log("Produce explanation plan...");
    const explaination = await collection.aggregate(pipeline).explain();
    // Execute the pipeline and retrieve results
    console.log("Execute pipeline...");
    const results = await collection.aggregate(pipeline).toArray();
    // If the output directory does not exist, attempt to create it
    try {
      await access(outFileDir, constants.R_OK | constants.W_OK);
    } catch(e) {
      await mkdir(outFileDir);
    }
    // Save the explanation plan and the results in two different files
    console.log("Write results json files...");
    await Promise.all([
      writeJsonRes(ouputFileDir, pipelineGenerator.fileName + '_explain', explaination),
      writeJsonRes(ouputFileDir, pipelineGenerator.fileName, results),
    ]);
    printTitle('Test ok');
  } catch(e) {
    console.error(e);
  } finally {
    client.close();
  }
}

// Compute pipeline generators dict
const PIPELINE_GENERATORS_BY_NAME = [...Object.values(basicSamples), ...Object.values(fullPipelines)]
  .reduce((acc, generator) => {
    acc[generator.fileName] = generator;
    return acc;
  }, {});
// Parse argv
if (process.argv.length < 3) {
  console.warn('Bad usage. a pipeline name is required');
  console.log(`usage: node ${process.argv[1]} pipelineName [outputFileDir]`);
  process.exit(1);
}
// If -h or --help is given, print help and exit
if (process.argv.slice(2).find(a => a === '-h' || a === '--help')) {
  console.log(`usage: node ${process.argv[1]} pipelineName [-h|--help] [outputFileDir]`);
  console.log();
  console.log('pipelineName: the name of the pipeline. Mandatory.');
  console.log('-h --help: print this help.');
  console.log('outputFileDir: the path of the output file directory. default is ./out');
  console.log();
  console.log('Pipeline name should be one the name following:')
  Object.keys(PIPELINE_GENERATORS_BY_NAME).forEach((pname) => {
    console.log(` - ${pname}`);
  });
  process.exit(0);
}
// Retrieve and check pipeline from argument
const selectedPipelineGenerator = PIPELINE_GENERATORS_BY_NAME[process.argv[2]];
if (!selectedPipelineGenerator){
  console.warn('Bad pipeline name. Available pipelines are:');
  Object.keys(PIPELINE_GENERATORS_BY_NAME).forEach((pname) => {
    console.log(` - ${pname}`);
  });
  process.exit(1);
}
// set the ouput directory if given
let outFileDir = process.argv[3] || './out';
if (outFileDir.endsWith('/')) {
  outFileDir = outFileDir.slice(0, -1);
}
// Test the pipeline and exit the program according to the success of its execution
testPipeline(selectedPipelineGenerator, outFileDir).then(() => {
  process.exit(0);
}, () => {
  process.exit(1);
});

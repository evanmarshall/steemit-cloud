var steem = require('steem');
const account = 'egmracer01';

// steem.api.getAccounts([account], function(err, result) {
//     // console.log(err, result);
//     const profile = result[0];
//     // console.log(`Hi my name is ${profile.name} and I joined Steemit on ${profile.created}`);
// });

steem.api.getAccountHistory(account, 10001, 10000, function(err, result) {
    // console.log(err, result);
    extractDataFromBlocks(result);
});

/**
 * getAccountHistory
 * returns:
 * Block[]
 * 
 * Block: (number, BlockInfo)
 * BlockInfo: { block: number, op: Operation }
 * Operation: ( typeOfOperation: string, opInfo: OperationInfo )
 * OperationInfo: { body: string, title: string, json_metadata: stringified_json }
 */

const extractDataFromBlocks = (blocks) => {
    const permlinkSet = new Set();
    const allCommentBodies = [];

    blocks.forEach((block) => {
        const [blockNumber, blockInfo] = block;
        const {op} = blockInfo;
        const [typeOfOperation, opInfo] = op;
        if (typeOfOperation === 'comment' && opInfo['author'] === account) {
            if (!permlinkSet.has(opInfo.permlink)) {
                permlinkSet.add(opInfo.permlink);
                allCommentBodies.push(opInfo.body);
            }
        }
    });

    const wordAndCount = extractWordAndCounts(allCommentBodies.join(' '));
    // console.log(wordAndCount);
    const words = Object.keys(wordAndCount);
    words.sort((word1, word2) => wordAndCount[word2] - wordAndCount[word1]);
    const listToPrint = [];
    words.forEach((word, index) => {
        if (index < 100) {
            listToPrint.push([word, wordAndCount[word]]);
        }
    });
    console.log(listToPrint);
};


const extractWordAndCounts = (text) => { 
    const wordAndCount = { };
    const words = text.split(/[ ,.\n]+/);
    words.forEach((word) => {
        const normalizedWord = word.toLowerCase();
        if ((/\W/g).test(normalizedWord)) {
            return;
        }
        if (wordAndCount[normalizedWord]) {
            wordAndCount[normalizedWord]++;
        } else {
            wordAndCount[normalizedWord] = 1;
        }
    });

    return wordAndCount;
}

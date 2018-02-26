// External Dependencies
import * as steem from 'steem';
import WordCloud from 'wordcloud';

// Internal Dependencies
import { ignoredWords } from './ignored-words';
import { demoWordFrequencies } from './demo-word-frequencies';

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

const extractDataFromBlocks = (account, blocks) => {
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
    const words = Object.keys(wordAndCount);
    words.sort((word1, word2) => wordAndCount[word2] - wordAndCount[word1]);
    const listToPrint = [];
    let normalizingFactor = null;
    words.forEach((word, index) => {
        if (ignoredWords.indexOf(word) !== -1) {
            return;
        }
        if (!normalizingFactor) {
            normalizingFactor = 14 / wordAndCount[word];
        }

        if (listToPrint.length < 100) {
            listToPrint.push([word, Math.max(1, normalizingFactor * wordAndCount[word])]);
        }
    });

    WordCloud(document.getElementById('word-cloud-canvas'), { list: listToPrint, minSize: 4, drawOutOfBound: true, weightFactor: 5.5 } );
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


/**
 * Initialize the word cloud with predefined results as an example
 */
$(document).ready(() => {
    $('.submit-button').click(function () { 
        var account = $('.username-input').val();
        steem.api.getAccountHistory(account, -1, 10000, function(err, result) {
            console.log(err, (result || []).length);
            if (result)
                extractDataFromBlocks(account, result);
        });
    });

    var canvas = document.getElementById('word-cloud-canvas');
    canvas.height = window.innerHeight * .75; // sizing canvas' sucks
    canvas.width = window.innerWidth * .6666;

    WordCloud(document.getElementById('word-cloud-canvas'), { list: demoWordFrequencies, minSize: 4, drawOutOfBound: true, weightFactor: 5.5 } );
});
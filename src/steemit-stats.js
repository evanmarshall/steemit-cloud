// External Dependencies
import * as steem from 'steem';
import WordCloud from 'wordcloud';

// Internal Dependencies
import { demoBlocks } from './demo-blocks';
import { createSentimentGraph } from './sentiment-analysis';
import { createWordCloud } from './word-cloud-analysis';

let currentChart = null;
const SentimentCanvasId = 'sentiment-canvas';
const WordCloudCanvasId = 'word-cloud-canvas';

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

    return allCommentBodies;
};

const createGraphs = (account, blocks) => {
    const allCommentBodies = extractDataFromBlocks(account, blocks);
    currentChart = createSentimentGraph(allCommentBodies, SentimentCanvasId);
    createWordCloud(allCommentBodies, WordCloudCanvasId);
};

/**
 * Initialize the word cloud with predefined results as an example
 */
$(document).ready(() => {
    $('.submit-button').click(function () { 
        var account = $('.username-input').val() || 'egmracer01';
        steem.api.getAccountHistory(account, -1, 10000, function(err, result) {
            console.log(err, (result || []).length);
            if (currentChart) {
                currentChart.destroy();
            }
            if (result) {
                createGraphs(account, result);
            }
        });
    });

    const canvas = document.getElementById(WordCloudCanvasId);
    canvas.height = window.innerHeight * .75; // sizing canvas' sucks
    canvas.width = window.innerWidth * .6666;
    const sentimentCanvas = document.getElementById(SentimentCanvasId);
    sentimentCanvas.height = window.innerHeight * .75; // sizing canvas' sucks
    sentimentCanvas.width = window.innerWidth * .6666;

    createGraphs('egmracer01', demoBlocks);
});
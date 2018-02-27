// External Dependencies
import * as steem from 'steem';
import WordCloud from 'wordcloud';
var sentiment = require('sentiment');
import Chart from 'chart.js';

// Internal Dependencies
import { ignoredWords } from './ignored-words';
import { demoWordFrequencies } from './demo-word-frequencies';

let currentChart = null;

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

    getSentiment(allCommentBodies);
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

function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

const getSentiment = (texts) => {
    const scoreRange = 10;
    const factor = 20;
    const scores = texts.map(text => sentiment(text).comparative);
    const buckets = Array.apply(null, Array(scoreRange * factor)).map(Number.prototype.valueOf,0);
    scores.forEach(score => {
        const normalizedScore = Math.min(scoreRange * factor, Math.max(0, Math.round((score + 5) * factor)));
        buckets[normalizedScore]++;
    });

    const ctx = document.getElementById('sentiment-canvas').getContext("2d");
    let colors = [];
    let labels = [];
    Array.apply(null, Array(scoreRange * factor)).map(Number.prototype.valueOf,0).map(
        (_, i) => {
            const opacity = Math.max(1, scoreRange * factor / Math.max(1, Math.abs(i - scoreRange * factor / 2)));
            
            if (i - scoreRange * factor / 2 === 0) {
                colors.push(`rgba(0, 0, 255, 1`);
            }
            else if (i <= scoreRange * factor / 2 - 1) {
                colors.push(`rgba(255, 0, 0, ${opacity}`);
            }
            else {
                colors.push(`rgba(0, 255, 0, ${opacity}`);
            }
            labels.push(precisionRound(i / factor - 5, 2));
        }
    );
    // const ctx = document.getElementById('sentiment-canvas').getContext("2d");
    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sentiment Analysis of Posts',
                data: buckets,
                backgroundColor: colors
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Number of posts and comments'
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Positivity'
                    }
                }]
            }
        }
    });
    console.log(chart);
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
        var account = $('.username-input').val() || 'egmracer01';
        steem.api.getAccountHistory(account, -1, 10000, function(err, result) {
            console.log(err, (result || []).length);
            if (currentChart) {
                myLineChart.destroy();
            }
            if (result) {
                extractDataFromBlocks(account, result);
            }
        });
    });
    setTimeout(() => {
        $('.submit-button').click();
    }, 1000);

    var canvas = document.getElementById('word-cloud-canvas');
    canvas.height = window.innerHeight * .75; // sizing canvas' sucks
    canvas.width = window.innerWidth * .6666;
    var sentimentCanvas = document.getElementById('sentiment-canvas');
    sentimentCanvas.height = window.innerHeight * .75; // sizing canvas' sucks
    sentimentCanvas.width = window.innerWidth * .6666;

    WordCloud(document.getElementById('word-cloud-canvas'), { list: demoWordFrequencies, minSize: 4, drawOutOfBound: true, weightFactor: 5.5 } );
});
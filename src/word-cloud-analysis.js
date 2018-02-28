import WordCloud from 'wordcloud';

import { ignoredWords } from './ignored-words';


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

export const createWordCloud = (allCommentBodies, wordCloudCanvas) => {
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

    WordCloud(document.getElementById(wordCloudCanvas), { list: listToPrint, minSize: 4, drawOutOfBound: true, weightFactor: 5.5 } );
}
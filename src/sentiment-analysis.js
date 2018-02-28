import Chart from 'chart.js';
var sentiment = require('sentiment');


function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

export const createSentimentGraph = (texts, canvasId) => {
    const scoreRange = 10;
    const factor = 20;
    const scores = texts.map(text => sentiment(text).comparative);
    const buckets = Array.apply(null, Array(scoreRange * factor)).map(Number.prototype.valueOf,0);
    scores.forEach(score => {
        const normalizedScore = Math.min(scoreRange * factor, Math.max(0, Math.round((score + 5) * factor)));
        buckets[normalizedScore]++;
    });

    const ctx = document.getElementById(canvasId).getContext("2d");
    let colors = []; // colors & labels must have the same length
    let labels = [];
    Array.apply(null, Array(scoreRange * factor)).map(Number.prototype.valueOf,0).map(
        (_, i) => {
            const opacity = Math.max(1, scoreRange * factor / Math.max(1, Math.abs(i - scoreRange * factor / 2)));
            
            if (i - scoreRange * factor / 2 === 0) {
                colors.push(`rgba(0, 0, 255, 1`); // Add blue for the neural bar in the middle
            }
            else if (i <= scoreRange * factor / 2 - 1) {
                colors.push(`rgba(255, 0, 0, ${opacity}`); // Add red for negative scores
            }
            else {
                colors.push(`rgba(0, 255, 0, ${opacity}`); // Add green for positive scores
            }
            labels.push(precisionRound(i / factor - scoreRange / 2, 2));
        }
    );

    return new Chart(ctx, {
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
};
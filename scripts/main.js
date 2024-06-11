//----------------------------------INPUT FIELD-------------------------------------
function setAmount(amount) {
    document.getElementById('sol-amount').value = amount;
}

//----------------------------------PROGRESS BAR-------------------------------------

const totalSupply = 355000000; // 355 million

async function updateProgressBar(accountPublicKey) {
    const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');
    const publicKey = new solanaWeb3.PublicKey(accountPublicKey);

    try {
        // Fetch the token account balance
        const balance = await connection.getTokenAccountBalance(publicKey);

        // Calculate the percentage of the remaining supply
        const remainingSupply = totalSupply - balance.value.uiAmount;
        const percentage = (remainingSupply / totalSupply) * 100;

        // Update the progress bar
        document.getElementById("progress").style.width = `${percentage}%`;
    } catch (error) {
        console.error("Error fetching the token balance:", error);
    }
}

// Call the function with the account's public key
updateProgressBar('5WSCXi2frdjH8f4ESxXQBRF1iZHWN2f6eQXVxZtqqFmd');

//--------------------------------TIMER---------------------------------------

const targetDate = new Date('2024-06-26T23:59:59').getTime(); // Set your target date and time here

function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
        document.getElementById('timer').textContent = "PRESALE V2 HAS ENDED";
        document.getElementById('timer-label').style.display = 'none';
        clearInterval(countdownInterval);
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    let timerText = '';
    if (days > 0) {
        timerText += `${days}d `;
    }
    if (days > 0 || hours > 0) {
        timerText += `${hours}h `;
    }
    if (days > 0 || hours > 0 || minutes > 0) {
        timerText += `${minutes}m `;
    }
    timerText += `${seconds}s`;

    document.getElementById('timer').textContent = timerText;
}

const countdownInterval = setInterval(updateTimer, 1000);
updateTimer(); // Initial call to display the timer immediately

//-------------------------------CHART----------------------------------------

//Data for the donut chart 
const presaleV1 = 29;
const presaleV2 = 35.5;
const liquidityPool = 35.5;

// Chart.js donut chart configuration
const ctx = document.getElementById('donutChart').getContext('2d');
const donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Presale V1', 'Presale V2', 'Liquidity Pool'],
        datasets: [{
            data: [presaleV1, presaleV2, liquidityPool],
            backgroundColor: ['#a807a5', '#de3edb', '#fa91f8'],
        }]
    },
    options: {
        plugins: {
            legend: {
                display: true,
                position: 'bottom', 
                labels: {
                    font: {
                        size: 14,
                        family: 'Loew', 
                        weight: 'bold', 
                    },
                    color: '#ffffff', 
                    usePointStyle: true,
                    boxWidth: 20,
                    padding: 20,
                },
                onClick: (e) => e.stopPropagation() 
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value}%`;
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest',
            intersect: true
        }
    }
});

function updateDonutChart() {
    donutChart.data.datasets[0].data = [presaleV1, presaleV2, liquidityPool];
    donutChart.update();
}

updateDonutChart();
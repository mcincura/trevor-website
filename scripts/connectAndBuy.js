document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed.');

    let buyerPublicKey = null;
    let isConnecting = false;
    let isBuying = false;

    // Function to get the provider
    function getProvider() {
        console.log('Checking for Phantom Wallet provider...');
        if (typeof window.solana !== 'undefined') {
            console.log('Solana object found in window.');
            const provider = window.solana;
            if (provider.isPhantom) {
                console.log('Phantom Wallet provider detected.');
                return provider;
            } else {
                console.log('Phantom Wallet provider not detected.');
            }
        } else {
            console.log('Solana object not found in window.');
        }
        return null;
    }

    // Function to detect if the user is on a mobile device
    function isMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /android|avantgo|blackberry|iemobile|ipad|iphone|ipod|opera mini|palm|webos|windows phone/i.test(userAgent);
    }

    // Function to connect to Phantom Wallet on desktop
    async function connectDesktop() {
        if (isConnecting) {
            return;
        }
        isConnecting = true;
        const provider = getProvider();
        if (provider) {
            console.log('Attempting to connect to Phantom Wallet on desktop...');
            try {
                const resp = await provider.connect();
                buyerPublicKey = resp.publicKey.toString();
                console.log('Connected to Phantom Wallet:', buyerPublicKey);
                alert('Connected to Phantom Wallet: ' + buyerPublicKey);
            } catch (err) {
                console.error('Error connecting to Phantom Wallet on desktop:', err);
                alert('Error connecting to Phantom Wallet: ' + err.message);
            } finally {
                isConnecting = false;
            }
        } else {
            isConnecting = false;
            console.error('Phantom Wallet is not installed.');
            alert('Phantom Wallet is not installed. Redirecting to installation page...');
            window.open('https://phantom.app/', '_blank');
        }
    }

    // Function to connect to Phantom Wallet on mobile
    function connectMobile() {
        if (isConnecting) {
            return;
        }
        isConnecting = true;
        console.log('Attempting to connect to Phantom Wallet on mobile...');
        alert('You will be redirected to the Phantom app for connection. Please click the connect button again in the Phantom app to connect your wallet.');
        const phantomAppUrl = 'https://phantom.app/ul/browse/https://trevor-solana.com'; // Replace 'yourwebsite.com' with your actual website
        window.location.href = phantomAppUrl;
        isConnecting = false;
    }

    // Add click event listener to the connect button
    const connectButton = document.getElementById('connect-wallet-btn');
    if (connectButton) {
        connectButton.addEventListener('click', function () {
            console.log('Connect button clicked.');
            if (isMobile()) {
                console.log('User is on a mobile device.');
                connectMobile();
            } else {
                console.log('User is on a desktop device.');
                connectDesktop();
            }
        });
    } else {
        console.error('Connect button not found in the DOM.');
    }

    // Function to set amount in the input field
    window.setAmount = function(amount) {
        const solAmountInput = document.getElementById('sol-amount');
        if (solAmountInput) {
            solAmountInput.value = amount;
        } else {
            console.error('Sol amount input not found in the DOM.');
        }
    }

    // Function to handle the buy action
    async function buyTrevor() {
        if (isBuying) {
            return;
        }
        isBuying = true;

        const solAmountInput = document.getElementById('sol-amount');
        if (!solAmountInput) {
            console.error('Sol amount input not found in the DOM.');
            isBuying = false;
            return;
        }

        const amountInSol = solAmountInput.value;
        if (!buyerPublicKey) {
            alert('Please connect your wallet first');
            isBuying = false;
            return;
        }

        try {
            // Call the AWS Lambda function to create the transaction
            const response = await fetch('https://3p31scd0x1.execute-api.eu-north-1.amazonaws.com/testing/buy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ buyerPublicKey, amountInSol }),
            });

            const result = await response.json();
            const transactionBase64 = result.transaction;

            // Decode the transaction from base64
            const transactionBuffer = new Uint8Array(atob(transactionBase64).split('').map(char => char.charCodeAt(0)));
            const transaction = solanaWeb3.Transaction.from(transactionBuffer);

            // Request the user to sign the transaction
            const { solana } = window;
            if (solana && solana.isPhantom) {
                const signedTransaction = await solana.signTransaction(transaction);
                const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');
                const signature = await connection.sendRawTransaction(signedTransaction.serialize());
                await connection.confirmTransaction(signature);

                alert(`Transaction successful with signature: ${signature}`);
            } else {
                alert('Phantom wallet is not installed');
            }
        } catch (error) {
            alert(`Transaction failed: ${error.message}`);
        } finally {
            isBuying = false;
        }
    }

    // Add click event listener to the buy button
    const buyButton = document.querySelector('.buy-trevor-btn');
    if (buyButton) {
        buyButton.addEventListener('click', async function (event) {
            event.preventDefault();
            console.log('Buy button clicked.');
            await buyTrevor();
        });
    } else {
        console.error('Buy button not found in the DOM.');
    }
});

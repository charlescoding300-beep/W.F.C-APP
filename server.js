require('dotenv').config();

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('================================');
    console.log('        WFC SERVER');
    console.log('   W in the fucking chat');
    console.log('================================');
    console.log(`Running on port ${PORT}`);
    console.log('');
});

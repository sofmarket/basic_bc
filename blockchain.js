const fs 		= require('fs');
const uuid 		= require('uuid');
const sha256 	= require('sha256');
const baseurl 	= process.argv[3];


function Blockchain() {

	this.chain = [];
	this.proof = 5;
	this.pending = [];
	
	this.nodes = [];
	this.baseurl = baseurl;

	this.load();

};

Blockchain.prototype.load = function() {
	let path = 'blockchain.json';
	if (fs.existsSync(path)) {
	    this.chain = JSON.parse(fs.readFileSync(path));
	} else {
		this.createNewBlock(100, '00000000', '00000000');
	}
};


Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
	
	const newBlock = {
		index: this.chain.length + 1,
		timestamp: Date.now(),
		transactions: this.pending,
		nonce: nonce,
		hash: hash,
		previousBlockHash: previousBlockHash
	};

	this.pending = [];
	this.chain.push(newBlock);

	fs.writeFileSync('blockchain.json', JSON.stringify(this.chain));
	
	return newBlock;

};


Blockchain.prototype.createTransaction = function(data) {	
	return {
		time: (new Date()).getTime(),
        student: {
            firstname: data.firstname, 
            lastname: data.lastname,
            email: data.email,
            cin: data.cin, 
            cne: data.cne
        },
        url: data.url,
        uid: uuid.v4((new Date()).getTime())
	};
};

Blockchain.prototype.addTransaction = function(transaction) {
	this.pending.push(transaction);
	return this.getLastBlock()['index'] + 1;
};

Blockchain.prototype.getLastBlock = function() {
	return this.chain[this.chain.length - 1];
};

Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
	const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
	const hash = sha256(dataAsString);
	return hash;
};

Blockchain.prototype.getProofStr = function(){
	let str = '';
	for(let i = 0; i < this.proof; i++)
		str += '0';
	return str;
}

Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
	let nonce = 0;
	let proofStr = this.getProofStr();
	let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	while(hash.substring(0, this.proof) != proofStr){
		nonce++;
		hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	}
	return nonce;
};

module.exports = Blockchain;
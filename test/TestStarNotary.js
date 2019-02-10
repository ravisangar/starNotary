const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let instance = await StarNotary.deployed();
    let name = "Ravi Star Token";
    let symbol = "RST";

    // 1. create a Star with different tokenId
    // not sure why start needs to be created to test name and symbol, but creating it as per instructions

    await instance.createStar("awesome start # 0", 6, {from: owner});

    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let retrievedName = await instance.name();
    let retrievedSymbol = await instance.symbol();

    assert.equal(name,retrievedName);
    assert.equal(symbol,retrievedSymbol);
});

it('lets 2 users exchange stars', async() => {

    let instance = await StarNotary.deployed();
    let user1 = accounts[1];

    let startOneId = 10;
    let starTwoId = 20;

    await instance.createStar("aswersome star # 1", startOneId, {from: owner});
    await instance.createStar("aswersome star # 2", starTwoId, {from: user1});

    let ownerOfTokenOne = await instance.ownerOf(startOneId);
    let ownerOfTokenTwo = await instance.ownerOf(starTwoId);

    await instance.exchangeStars(startOneId,starTwoId);

    ownerOfTokenOne = await instance.ownerOf(startOneId);
    ownerOfTokenTwo = await instance.ownerOf(starTwoId);

    assert.equal(ownerOfTokenOne, user1);
    assert.equal(ownerOfTokenTwo,owner);

});

it('lets a user transfer a star', async() => {

    let instance = await StarNotary.deployed();
    let starOneId = 25;
    let user1 = accounts[1];

    await instance.createStar("awersome star # 3", starOneId,{from: owner});

    await instance.transferStar(user1,starOneId);

    let newOwner = await instance.ownerOf(starOneId);

    assert.equal(newOwner,user1);

});

it('lookUptokenIdToStarInfo test', async() => {

    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starOneId = 30;
    let starName = "awesome star # 4";

    await instance.createStar(starName, starOneId, {from: user1});

    let startNameLookUp = await instance.lookUptokenIdToStarInfo(starOneId);

    assert.equal(starName,startNameLookUp);

});

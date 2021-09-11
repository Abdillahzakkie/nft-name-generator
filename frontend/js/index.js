import { abi as nGenABI } from "./abi/nGen.js";
import { Base64 } from "https://cdn.jsdelivr.net/npm/js-base64@3.6.1/base64.mjs";
const { decode } = Base64;

const mintButton = document.querySelector(".mint");
const img = document.querySelector("#generated-Image");
const imageWrapper = document.querySelector(".name-gen-images");
const form = document.querySelector(".form-control");

const nftData = document.querySelector(".nft-data");
const nftName = document.querySelector("#nft-name");
const nftDescription = document.querySelector("#nft-description");
const nftImage = document.querySelector("#nft-Image");

const NGenAddress = "0x12cB74B8892Ad96B51d8011bf12808edD62792B4";

let web3;
let user;
let NGen;
let Fee = 0;

const toWei = (_amount) => web3.utils.toWei(_amount.toString(), "ether");

window.addEventListener("DOMContentLoaded", async () => {
	await loadWeb3();
});

const loadWeb3 = async () => {
	try {
		await ethereum.enable();

		if (!ethereum)
			return alert(
				"Non-Ethereum browser detected. You should consider trying Metamask"
			);
		web3 = new Web3(ethereum);
		// Get Network / chainId
		const _chainId = await ethereum.request({ method: "eth_chainId" });
		if (parseInt(_chainId, 16) !== 4)
			return alert("Connect wallet to a rinkeby network");

		const _accounts = await ethereum.request({ method: "eth_accounts" });
		user = _accounts[0];

		NGen = new web3.eth.Contract(nGenABI, NGenAddress);
		Fee = await NGen.methods.Fee().call();
	} catch (error) {
		console.log(error.message);
		return error.message;
	}
};

const getNftById = async (_tokenId) => {
	try {
		const _tokenURI = (await NGen.methods.tokenURI(_tokenId).call()).split(
			","
		)[1];
		return JSON.parse(decode(_tokenURI));
	} catch (error) {
		return error;
	}
};

mintButton.addEventListener("click", async () => {
	try {
		const _result = await NGen.methods.mint().send({
			from: user,
			value: Fee,
		});
		const _tokenId = _result.events.Transfer.returnValues.tokenId;

		const { image } = await getNftById(_tokenId);

		img.setAttribute("src", image);
		imageWrapper.classList.remove("hidden");
	} catch (error) {
		console.log(error);
		return error;
	}
});

form.addEventListener("submit", async (e) => {
	e.preventDefault();

	try {
		const input = e.currentTarget.elements[0].value;

		const _totalSupply = parseInt(await NGen.methods.totalSupply().call());

		if (_totalSupply <= parseInt(input)) return;
		const { name, description, image } = await getNftById(input);
		nftName.textContent = `Name: ${name}`;
		nftDescription.textContent = `Description: ${description}`;
		nftImage.setAttribute("src", image);

		nftData.classList.remove("hidden");
	} catch (error) {
		return error;
	}
});

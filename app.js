
const { Connection, Keypair, PublicKey} = require('@solana/web3.js');
const { 
    Metaplex, 
    keypairIdentity, 
    bundlrStorage, 
    toMetaplexFile, 
    toBigNumber, 
    CreateCandyMachineInput, 
    DefaultCandyGuardSettings, 
    CandyMachineItem, 
    toDateTime, 
    sol, 
    TransactionBuilder, 
    CreateCandyMachineBuilderContext 
} = require('@metaplex-foundation/js');
const secret = require('./keypair.json');
const testWallet = require('./testWallet.json');
const conn = new Connection('https://api.devnet.solana.com', { commitment: "finalized" });
const WALLET = Keypair.fromSecretKey(new Uint8Array(secret));
const METAPLEX = Metaplex.make(conn).use(keypairIdentity(WALLET));

const NFT_METADATA = 'https://v2.akord.com/public/vaults/active/vbpMj79h-nx8YOpI6qMxJZ_uWxqJX43Ix3GheCOJ4M4/gallery#public/c5790843-3cd0-47cd-9d3a-7ae5b634abbb'; 
const COLLECTION_NFT_MINT = 'G3CJumryHs3GSbab4gvK3BDaKKG1RRda7sGN5Q2trBTk'; 
const CANDY_MACHINE_ID = 'ASNXwTsYoDimSPm59SmwSNfJQkoCeDsnposTaG8uF4KZ';



async function createCollectionNft() {
    const { nft: collectionNft } = await METAPLEX.nfts().create({
        name: 'Test Name',
        uri: NFT_METADATA,
        sellerFeeBasisPoints: 0,
        isCollection: true,
        updateAuthority: WALLET,
    });
    console.log(`✅ - Minted Collection NFT: ${collectionNft.address.toString()}`);
    console.log(`     https://explorer.solana.com/address/${collectionNft.address.toString()}?cluster=devnet`);
}

// createCollectionNft();

async function generateCandyMachine() {

    const candyMachineSettings = {
        itemsAvailable: toBigNumber(3), // Tamanho da coleção: 3
        sellerFeeBasisPoints: 1000, // 10% Royalties da Coleção
        symbol: "Test",
        maxEditionSupply: toBigNumber(0), // 0 reproduções para cada NFT
        isMutable: true,
        creators: [{ address: WALLET.publicKey, share: 100 }],
        collection: {
            address: new PublicKey(COLLECTION_NFT_MINT), // Can replace with your own NFT or upload a new one
            updateAuthority: WALLET,
        },
    };
    const { candyMachine } = await METAPLEX.candyMachines().create(candyMachineSettings);
    console.log(`✅ - Created Candy Machine: ${candyMachine.address.toString()}`);
    console.log(`     https://explorer.solana.com/address/${candyMachine.address.toString()}?cluster=devnet`);
}

// generateCandyMachine();


async function updateCandyMachine() {

    const candyMachine = await METAPLEX.candyMachines().findByAddress({ address: new PublicKey(CANDY_MACHINE_ID) });
    const { response } = await METAPLEX.candyMachines().update({
        candyMachine,
        guards: {
            startDate: { 
                date: toDateTime("2022-10-17T16:00:00Z") 
            },
            mintLimit: {
                id: 1,
                limit: 2,
            },
            solPayment: {
                amount: sol(0.1),
                destination: METAPLEX.identity().publicKey,
            },
        }
    })
    console.log(`✅ - Updated Candy Machine: ${CANDY_MACHINE_ID}`);
    console.log(`     https://explorer.solana.com/tx/${response.signature}?cluster=devnet`);
}

// updateCandyMachine();

async function addItems() {
    const candyMachine = await METAPLEX.candyMachines().findByAddress({ address: new PublicKey(CANDY_MACHINE_ID) }); 
    const items = [];
    for (let i = 0; i < 3; i++ ) {
        items.push({
            name: `QuickNode Demo NFT # ${i+1}`,
            uri: NFT_METADATA
        })
    }
    const { response } = await METAPLEX.candyMachines().insertItems(
        {
            candyMachine,
            items: items,
        },
        {
            commitment:'finalized'
        }
    );
    console.log(`✅ - Items added to Candy Machine: ${CANDY_MACHINE_ID}`);
    console.log(`     https://explorer.solana.com/tx/${response.signature}?cluster=devnet`);
}

// addItems();

async function mintNft() {
    const candyMachine = await METAPLEX.candyMachines().findByAddress({ address: new PublicKey(CANDY_MACHINE_ID) }); 
    let { nft, response } = await METAPLEX.candyMachines().mint(
        {
            candyMachine,
            collectionUpdateAuthority: WALLET.publicKey,
        },
        {
            commitment:'finalized'
        }
    )
    console.log(`✅ - Minted NFT: ${nft.address.toString()}`);
    console.log(`     https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);
    console.log(`     https://explorer.solana.com/tx/${response.signature}?cluster=devnet`);
}

mintNft()
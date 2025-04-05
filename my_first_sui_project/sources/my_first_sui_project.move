module my_first_sui_project::NFTModule {
    use sui::display; // https://docs.sui.io/references/framework/sui-framework/display
    use sui::package; // https://docs.sui.io/references/framework/sui-framework/package

    use sui::object;
    use sui::tx_context::TxContext;
    use sui::transfer;

    public struct NFT has key, store {
        id: object::UID,
        // name: vector<u8>,
        // description: vector<u8>,
        // url: vector<u8>,
    }

    // Define the one-time witness type with the uppercase module name
    public struct NFTMODULE has drop {}

    // Correct the init function to use NFTMODULE (no reference and proper type)
    fun init(otw: NFTMODULE, ctx: &mut TxContext) {
        let keys = vector[
            b"name".to_string(),
            b"description".to_string(),
            b"image_url".to_string(),
        ];

        let values = vector[
            b"NFT".to_string(),
            b"This is an NFT!".to_string(),
            b"https://xc6fbqjny4wfkgukliockypoutzhcqwjmlw2gigombpp2ynufaxa.arweave.net/uLxQwS3HLFUailocJWHupPJxQsli7aMgzmBe_WG0KC4".to_string(),
        ];

        let publisher = package::claim(otw, ctx);

        let mut display = display::new_with_fields<NFT>(
            &publisher, keys, values, ctx
        );

        display::update_version(&mut display);

        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    /*
      Creates and returns a new NFT object.
    */
    public fun new(ctx: &mut TxContext): NFT {
        NFT {
            id: object::new(ctx) 
        }
    }

    public fun transfer_nft(nft: NFT, recipient: address) {
        transfer::transfer(nft, recipient);
    }
}

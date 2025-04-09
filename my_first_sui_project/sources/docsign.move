module docsign::document {
    use sui::event;

    public struct DocumentRegisteredEvent has copy, drop, store {
        doc_hash: vector<u8>,
        owner: address,
        cid: vector<u8>,
    }

    public struct DocumentSignedEvent has copy, drop, store {
        doc_hash: vector<u8>,
        signer: address,
        signature: vector<u8>,
    }

    public entry fun register_document(
        doc_hash: vector<u8>,
        cid: vector<u8>,
        ctx: &mut TxContext
    ) {
        let owner = tx_context::sender(ctx);
        event::emit(DocumentRegisteredEvent { doc_hash, owner, cid });
    }

    public entry fun sign_document(
        doc_hash: vector<u8>,
        signature: vector<u8>,
        ctx: &mut TxContext
    ) {
        let signer = tx_context::sender(ctx);
        event::emit(DocumentSignedEvent { doc_hash, signer, signature });
    }
}
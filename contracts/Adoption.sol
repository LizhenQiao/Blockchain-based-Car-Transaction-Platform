pragma solidity ^0.5.0;

contract Adoption {
    struct Item {
        string vehicle_brand; // vehicle's brand
        string vehicle_model; // which specific model is this vehicle
        string description; // information about a vehicle, e.g. production year, mileage
        uint256 buy_now_price;
        uint256 starting_price; // starting price
        uint256 min_incr; // minimum increment for a bid
        uint256 offer_price; // current price of item
        // string picture;
    }

    address[16] public buyers; // array of ethereum addresses
    uint256 constant carCount = 10;
    uint256 public numOfPurchases = 0;
    uint256 public itemId = 0;
    mapping(uint256 => Item) public vehicles; // item hash table
    mapping(uint256 => address) public highestOfferers; // highest bidders hash table
    mapping(uint256 => uint256) public likesForItems; // likes for cars hash table
    event offerPlacement(uint256 _vehicleId, uint256 indexed _offerAmount); // Declaring events which help us use ethereum's logging facility

    function addItem(
        string memory vehicle_brand,
        string memory vehicle_model,
        string memory description,
        uint256 buy_now_price,
        uint256 starting_price,
        uint256 min_incr,
        uint256 offer_price
    ) public returns (uint256) {
        vehicles[itemId] = Item(
            vehicle_brand,
            vehicle_model,
            description,
            buy_now_price,
            starting_price,
            min_incr,
            offer_price
            // picture
        );
        highestOfferers[itemId] = address(0);
        likesForItems[itemId] = 0;
        itemId++;
        return itemId;
    }

    constructor() public {
        addItem("BMW", "M2", "need info here", 300, 150, 10, 150);
        addItem("Mercedes", "GTR", "need info here", 200, 120, 8, 120);
        addItem("Honda", "Civic Type-R", "need info here", 180, 100, 7, 100);
        addItem("Volkswagen", "Golf gti", "need info here", 20, 10, 1, 10);
        addItem("BMW", "M3", "need info here", 22, 10, 1, 10);
        addItem("Mercedes", "c63", "need info here", 170, 100, 5, 100);
        addItem("Honda", "s2000", "need info here", 15, 5, 1, 15);
        addItem("Volkswagen", "Golf r", "need info here", 200, 110, 6, 110);
        addItem("Ford", "f150", "need info here", 150, 60, 3, 60);
        addItem("Ram", "1500", "need info here", 400, 150, 20, 150);
    }

    // Adopting a pet
    function adopt(uint256 petId) public returns (uint256) {
        require(petId >= 0 && petId <= 15);
        buyers[petId] = msg.sender;
        numOfPurchases = numOfPurchases + 1;
        return petId;
    }

    // Retrieving the adopters
    function getAdopters() public view returns (address[16] memory) {
        return buyers;
    }

    function addLike(uint256 itemId) public returns (uint256) {
        require(
            itemId >= 0 && itemId <= carCount,
            "Liked item does not exist."
        );
        likesForItems[itemId] = likesForItems[itemId] + 1;
        return likesForItems[itemId];
    }

    function getAllLikes() public view returns (uint256[carCount] memory) {
        uint256[carCount] memory result;
        for (uint256 i = 0; i < carCount; i++) {
            result[i] = likesForItems[i];
        }
        return result;
    }

    function getLikeById(uint256 itemId) public view returns (uint256) {
        require(
            itemId >= 0 && itemId < carCount,
            "Get like item does not exist."
        );
        return likesForItems[itemId];
    }

    function getNumOfPurchase() public view returns (uint256) {
        return numOfPurchases;
    }

    function getItemPrice(uint256 _itemId) public view returns (uint256) {
        require(_itemId >= 0 && _itemId < carCount, "Item does not exist"); // the item id must be greater than 0 but less or equal to the total count
        return vehicles[_itemId].offer_price;
    }

    function getAllPrices() public view returns (uint256[carCount] memory) {
        uint256[carCount] memory result;
        for (uint256 i = 0; i < carCount; i++) {
            result[i] = this.getItemPrice(i);
        }
        return result;
    }

    function getHighestOfferer()
        public
        view
        returns (address[carCount] memory)
    {
        address[carCount] memory arrayOfBidders;
        for (uint256 i = 0; i < carCount; i++) {
            arrayOfBidders[i] = highestOfferers[i];
        }
        return arrayOfBidders;
    }

    function placeNewOffer(uint256 _vehicleId, uint256 _offerAmount)
        public
        returns (uint256)
    {
        // Requirements
        require(
            _vehicleId >= 0 && _vehicleId < carCount,
            "Item trying to play new offer on is invalid"
        );
        require(
            check_offer_high_enough(_vehicleId, _offerAmount),
            "New Offer is lower or equal to the highest bid value"
        );
        require(
            check_highest_bidder(_vehicleId, msg.sender),
            "Person bidding is the highest bidder"
        );

        vehicles[_vehicleId].offer_price = _offerAmount;
        highestOfferers[_vehicleId] = msg.sender;

        emit offerPlacement(_vehicleId, _offerAmount);

        return _vehicleId; // return the item back
    }

    function check_offer_high_enough(uint256 _vehicleId, uint256 _offerAmount)
        public
        view
        returns (bool)
    {
        if (_offerAmount > vehicles[_vehicleId].offer_price) return true;
        else return false;
    }

    function check_highest_bidder(uint256 _vehicleId, address _wallet)
        public
        view
        returns (bool)
    {
        if (_wallet == highestOfferers[_vehicleId]) {
            return false;
        } else {
            return true;
        }
    }
}

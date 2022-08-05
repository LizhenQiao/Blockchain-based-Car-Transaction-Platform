App = {
  web3Provider: null,
  contracts: {},
  account: "0x0000000000000000000000000000000000000000",

  // Render the page.
  init: async function (obj) {
    $.getJSON("../cars.json", function (data) {
      console.log(obj);
      var carRow = $("#carRow");
      var cardFrame = $("#cardFrame");
      for (i = 0; i < data.length; i++) {
        if (obj == null) {
          cardFrame.find(".panel-title").text(`Vehicle ${i + 1}`); // auction number as title
          cardFrame.find("img").attr("src", data[i].picture); // image
          cardFrame.find(".card-text").text(data[i].description);
          cardFrame.find(".vehicle_brand").text(data[i].vehicle_brand); // name of item
          cardFrame.find(".vehicle_model").text(data[i].vehicle_model); // name of item
          cardFrame.find(".buy_now_price").text(`ETH ${data[i].buy_now_price}`); // name of item
          cardFrame.find(".min_incr").text(`ETH ${data[i].min_incr}`); // minimum increment
          cardFrame
            .find(".starting_price")
            .text(`ETH ${data[i].starting_price}`); // base price
          cardFrame.find(".btn-buy").attr("data-id", data[i].id);
          cardFrame.find(".btn-submit").attr("data-id", data[i].id);
          cardFrame.find(".btn-like").attr("data-id", data[i].id);
          cardFrame.find(".likes").text(`${data[i].likes} likes`);

          // Creating identifier attributes for HTML elements
          cardFrame.find(".highest-bid").attr("data-id", data[i].id); // adding attribute to the highest bid so we can dynamically change it
          cardFrame.find(".btn-submit").attr("data-id", data[i].id); // adding attribute for submit so we can associate itemids to submit buttons
          cardFrame.find(".ipt-amt").attr("id", `input-amt-${data[i].id}`); // same as above for input amount
          cardFrame.find(".ipt-amt").attr("step", `${data[i].min_incr}`); // same as above for input amount
          cardFrame.find(".ipt-amt").attr("min", `${data[i].starting_price}`); // same as above for input amount
          $(".card-area").append(cardFrame.html());
        } else {
          if (data[i].vehicle_brand.toUpperCase() == obj.toUpperCase()) {
            console.log(obj.toUpperCase());
            console.log(data[i].vehicle_brand.toUpperCase());

            cardFrame.find(".panel-title").text(`Vehicle ${i + 1}`); // auction number as title
            cardFrame.find("img").attr("src", data[i].picture); // image
            cardFrame.find(".card-text").text(data[i].description);
            cardFrame.find(".vehicle_brand").text(data[i].vehicle_brand); // name of item
            cardFrame.find(".vehicle_model").text(data[i].vehicle_model); // name of item
            cardFrame
              .find(".buy_now_price")
              .text(`ETH ${data[i].buy_now_price}`); // name of item
            cardFrame.find(".min_incr").text(`ETH ${data[i].min_incr}`); // minimum increment
            cardFrame
              .find(".starting_price")
              .text(`ETH ${data[i].starting_price}`); // base price
            cardFrame.find(".likes").text(`${data[i].likes} likes`);

            cardFrame.find(".btn-buy").attr("data-id", data[i].id);
            cardFrame.find(".btn-submit").attr("data-id", data[i].id);
            cardFrame.find(".btn-like").attr("data-id", data[i].id);

            // Creating identifier attributes for HTML elements
            cardFrame.find(".highest-bid").attr("data-id", data[i].id); // adding attribute to the highest bid so we can dynamically change it
            cardFrame.find(".btn-submit").attr("data-id", data[i].id); // adding attribute for submit so we can associate itemids to submit buttons
            cardFrame.find(".ipt-amt").attr("id", `input-amt-${data[i].id}`); // same as above for input amount
            cardFrame.find(".ipt-amt").attr("step", `${data[i].min_incr}`); // same as above for input amount
            cardFrame.find(".ipt-amt").attr("min", `${data[i].starting_price}`); // same as above for input amount
            console.log(1);
            $(".card-area").append(cardFrame.html());
          }
        }
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function () {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Adoption.json", function (data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          App.account = account;
          $("#account").text(account);
        }
      });

      // Use our contract to retrieve and mark the adopted pets
      return (
        App.markPurchase(),
        App.updateOfferPrice(),
        App.updateNumOfPurchase(),
        App.updateHighestOfferer()
      );
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on("click", ".btn-buy", App.handlePurchase);
    $(document).on("click", ".btn-submit", App.handleNewOffer);
    $(document).on("click", ".btn-like", App.handleLike);
  },

  // Add like to one car
  handleLike: function (event) {
    event.preventDefault();

    var carId = parseInt($(event.target).data("id"));
    var likeInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      App.contracts.Adoption.deployed()
        .then(function (instance) {
          likeInstance = instance;
          return likeInstance.addLike(carId, { from: account });
        })
        .then(function (result) {
          return App.updateLikes(carId);
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
  },

  // get likes by car id
  updateLikes: function (carId) {
    var likeInstance;
    App.contracts.Adoption.deployed()
      .then(function (instance) {
        likeInstance = instance;

        return likeInstance.getLikeById(carId);
      })
      .then(function (likenum) {
        console.log(likenum);
        $(document).find(".likes").eq(carId).text(`${likenum} likes`);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  // updateAllLikes: function () {
  //   var offerInstance;
  //   App.contracts.Adoption.deployed()
  //     .then(function (instance) {
  //       offerInstance = instance;
  //       return offerInstance.getAllLikes.call();
  //     })
  //     .then(function (result) {
  //       for (j = 0; j < result.length; j++) {
  //         $(document).find(".likes").eq(j).text(`ALL Likes ${result[j]}`);
  //       }
  //     })
  //     .catch(function (err) {
  //       console.log(err.message);
  //     });
  // },

  markPurchase: function () {
    var adoptionInstance;

    App.contracts.Adoption.deployed()
      .then(function (instance) {
        adoptionInstance = instance;

        return adoptionInstance.getAdopters.call();
      })
      .then(function (adopters) {
        for (i = 0; i < adopters.length; i++) {
          if (adopters[i] !== "0x0000000000000000000000000000000000000000") {
            $(".card").eq(i).find("button").attr("disabled", true);
            $(".card").eq(i).find("input").val("");
            $(".card")
              .eq(i)
              .find("input")
              .attr("placeholder", "This item has been sold");
          }
        }
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  handlePurchase: function (event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data("id"));

    var adoptionInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed()
        .then(function (instance) {
          adoptionInstance = instance;

          // Execute adopt as a transaction by sending account
          return adoptionInstance.adopt(petId, { from: account });
        })
        .then(function (result) {
          return App.markPurchase(), App.updateNumOfPurchase();
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
  },

  updateNumOfPurchase: function () {
    var offerInstance;
    App.contracts.Adoption.deployed()
      .then(function (instance) {
        offerInstance = instance;
        return offerInstance.getNumOfPurchase.call();
      })
      .then(function (result) {
        $(document).find(".num-purchase").text(`${result}`);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  updateOfferPrice: function () {
    var offerInstance;
    App.contracts.Adoption.deployed()
      .then(function (instance) {
        offerInstance = instance;
        return offerInstance.getAllPrices.call();
      })
      .then(function (result) {
        for (j = 0; j < result.length; j++) {
          $(document).find(".highest-bid").eq(j).text(`ETH ${result[j]}`);
        }
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  updateHighestOfferer: function () {
    var offerInstance;

    App.contracts.Adoption.deployed()
      .then(function (instance) {
        offerInstance = instance;

        return offerInstance.getHighestOfferer.call();
      })
      .then(function (result) {
        for (j = 0; j < result.length; j++) {
          $(document).find(".highest-account").eq(j).text(`${result[j]}`);
        }
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  handleNewOffer: function (event) {
    event.preventDefault();

    var vehicleId = parseInt($(event.target).data("id"));
    var offerAmount = parseInt($(`#input-amt-${vehicleId}`).val());

    var offerInstance;
    var account = App.account;

    App.contracts.Adoption.deployed()
      .then(function (instance) {
        offerInstance = instance;

        // Execute place bid as a transaction by sending account
        return offerInstance.placeNewOffer(vehicleId, offerAmount, {
          from: account,
        });
      })
      .then(function (result) {
        return (
          App.updateNumOfPurchase(),
          App.updateOfferPrice(),
          App.updateHighestOfferer()
        );
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});

$("#search").keypress(function (e) {
  if (e.which == 13) {
    $(".card-area").empty();
    App.init($(this).val() !== "" ? $(this).val() : null);
  }
});

$('input:radio[name="optradio"]').click(function () {
  $(".card-area").empty();
  var checkValue = $('input:radio[name="optradio"]:checked').val();
  App.init(checkValue !== "" ? checkValue : null);
});

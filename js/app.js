class ZAMATO {
    constructor(){
        this.appi = "db6e99e17b715df63cb77051df4ce9af";
        this.header = {
            method: "GET",
            headers: {
                "user-key": this.appi,
                "Content-Type": "application/json"
            },
            credentials: "same-origin"
        };
    }

    async searchAPI(city, categoryID){
        //category URL
        const categoryURL = `https://developers.zomato.com/api/v2.1/categories`;

        const cityURL = `https://developers.zomato.com/api/v2.1/cities?q=${city}`;

        //category data
        const categoryInfo = await fetch(categoryURL, this.header);
        const categoryJSON = await categoryInfo.json();
        const categories = await categoryJSON.categories;

        //search city
        const cityInfo  = await fetch(cityURL, this.header);
        const cityJSON = await cityInfo.json();
        const cityLocation = await cityJSON.location_suggestions;

        let cityID = 0;
        if(cityLocation.length>0){
            cityID = await cityLocation[0].id;
        }

        //search restarurant
        const restarurantURL = `https://developers.zomato.com/api/v2.1/search?entity_id=${cityID}&entity_type=city&category=${categoryID}&sort=rating&order=asc`;
        console.log("URL restaurants: ", restarurantURL);

        const restarurantInfo = await fetch(restarurantURL, this.header);
        const restarurantJSON = await restarurantInfo.json();
        console.log("=>Restaurant JSON ", restarurantJSON);
        const restaurants = await restarurantJSON.restaurants;
        console.log("Restaurnts OBJ: ",restaurants);

        return {
            categories,
            cityID,
            restaurants
        };
    }
}

class UI {
    constructor(){
        this.loader = document.querySelector(".loader");
        this.restaurantList = document.getElementById("restaurant-list");
    }

    addSelectoptions (categories){
        const search = document.getElementById("searchCategory");
        let output = `<option value='0' selected>select category</option>`;
        categories.forEach(category => {
            output +=`<option value="${category.categories.id}">${category.categories.name}</option>`;
        });
        search.innerHTML = output;
    }

    showFeedBack(text){
        const feedBack = document.querySelector('.feedback');
        feedBack.classList.add('showItem');
        feedBack.innerHTML = `<p>${text}</p>`;
        setTimeout(()=>{
            feedBack.classList.remove('showItem');
        },3000)
    }

    showLoader(){
        this.loader.classList.add('showItem');
    }

    hiddeLoader(){
        this.loader.classList.remove('showItem');
    }

    getRestaurants(restaurants){
        this.hiddeLoader();
        if(restaurants.length === 0){
            this.showFeedBack('no such categories exist in the selected');
        }
        else{
            //console.log("Size: ",restaurants[0].restaurant);
            this.restaurantList.innerHTML = '';
            restaurants.forEach((restaurant) =>{
                    const {thumb:img, name, location:{address}, user_rating:{aggregate_rating}
                ,cuisines, average_cost_for_two:cost, menu_url, url }
                    = restaurant.restaurant;

                if(img !== ''){
                    this.showRestaurant(img, name, address, aggregate_rating, cuisines, cost, menu_url, url);

                }
            });
        }
    }
    showRestaurant(img, name, address, aggregate_rating, cuisines, cost, menu_url, url){
        const div = document.createElement('div');
        div.classList.add('col-11', 'mx-auto', 'my-3', 'col-md-4');

        div.innerHTML = `<div class="card">
         <div class="card">
          <div class="row p-3">
           <div class="col-5">
            <img src="${img}" class="img-fluid img-thumbnail" alt="">
           </div>
           <div class="col-5 text-capitalize">
            <h6 class="text-uppercase pt-2 redText">${name}</h6>
            <p>${address}</p>
           </div>
           <div class="col-1">
            <div class="badge badge-success">
             ${aggregate_rating}
            </div>
           </div>
          </div>
          <hr>
          <div class="row py-3 ml-1">
           <div class="col-5 text-uppercase ">
            <p>cousines :</p>
            <p>cost for two :</p>
           </div>
           <div class="col-7 text-uppercase">
            <p>${cuisines}</p>
            <p>${cost}</p>
           </div>
          </div>
          <hr>
          <div class="row text-center no-gutters pb-3">
           <div class="col-6">
            <a href="${menu_url}" target="_blank" class="btn redBtn  text-uppercase"><i class="fas fa-book"></i> menu</a>
           </div>
           <div class="col-6">
            <a href="${url}" target="_blank" class="btn redBtn  text-uppercase"><i class="fas fa-book"></i> website</a>
           </div>
          </div>
         </div>`;
        this.restaurantList.appendChild(div);
    }
}

(function(){
    const searchForm = document.getElementById("searchForm");
    const searchCity = document.getElementById("searchCity");
    const searchCategory = document.getElementById("searchCategory");

    const zamato = new ZAMATO();

    const ui = new UI();
    //add select options 
    document.addEventListener("DOMContentLoaded", ()=>{
        //logic goes here
        zamato.searchAPI().then(data =>{
            console.log(data)
            ui.addSelectoptions(data.categories)
        });
    });

    searchForm.addEventListener("submit", event=>{
        event.preventDefault();
        const city = searchCity.value.toLowerCase();
        const categoryID = parseInt(searchCategory.value);
        if(city === '' || categoryID ===0){
            ui.showFeedBack('please enter a city and select category');
        }else{
            zamato.searchAPI(city).then(cityData=>{
                console.log("City ID: ", cityData.cityID); 
                if(cityData.cityID === 0){
                    ui.showFeedBack('please enter a valid city¡');
                }else{
                    ui.showLoader();
                    zamato.searchAPI(cityData.cityID, categoryID).then(data =>{
                        console.log("100 Search by Cat and City: ", data.restaurants);
                        ui.getRestaurants(data.restaurants);
                    });
                }
            });
        }
    })

})();
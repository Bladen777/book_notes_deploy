// listener for clicks
    let body_click = document.querySelector("body");
    let open_element = document.getElementsByClassName("outside_click_track")
    
    body_click.addEventListener("click",body_clicked);
    
    function body_clicked(ele){
        let ele_click_track = 0;
        for(i=0; i<open_element.length; i++){
        let keep_ele_open = open_element[i].contains(ele.target);
        console.log("result of click: ", keep_ele_open);

            if (keep_ele_open === true){

                //input functions to call to close elements on outside click
                //set parameter to "close" to let functions differentiate clicks
                switch(i){

                    case 0:
                        console.log("case 0 true")
                        ele_click_track = 1
                    break;

                    case 1:
                        console.log("case 1 true")
                        ele_click_track = 2
                    break;
                };
            }
        };
        console.log("ele_click_track: ", ele_click_track);
        if (ele_click_track === 0){
            search_input_clicked("close");
        }
        
    }

// search box 

    //dropdown control
    let search_input_box = document.getElementById("search_input");
    let search_dropdown = document.getElementsByClassName("book_search_box");
    let search_list = document.getElementsByClassName("search_list");

    search_input_box.addEventListener("click",()=>{search_input_clicked(1)});

    function search_input_clicked(open){
        if (open === "close"){
            search_dropdown[0].classList.add("search_dropdown_hide");
        } else if (search_input_box.value !== ""){
            search_dropdown[0].classList.remove("search_dropdown_hide");
        }
        
        ;
    }

    //fetch content
    
    search_input_box.addEventListener("keyup",fetchbooks);
    
    //variables and function for delay
    let wait = 0;
    let delay_start;
   
    function delay(){
        wait=1;
        console.log("wait function: ", wait);
        fetchbooks();
    }

    // define array to store the searched book results

    const search_books = [];

    //run this function on key input in text input
    async function fetchbooks(){
        //add delay so the info is not fetched on every key input
        console.log("wait: ",wait);
        if (wait === 0){
            clearTimeout(delay_start);
            delay_start = setTimeout(delay,500);
        } else if(wait === 1){
            wait=0;
            //fetch the books
            try{
                let search_input = search_input_box.value.trim();
                console.log("current input: ",search_input);
                
                const response = await fetch(`https://openlibrary.org/search.json?q=${search_input}&fields=key,title,author_name,cover_edition_key&limit=7`);
                const json_response = await response.json();
                const response_array = json_response.docs;

                search_list[0].innerHTML = "";   
                
                let search_count = 0;
                response_array.forEach(current_value => {
                    
                    try{
                    book_cover = current_value.cover_edition_key;
                    book_title = current_value.title;
                    book_author = current_value.author_name[0];
                    
                    if (book_cover === undefined || book_title === undefined || book_author === undefined){
                        console.log("checking for failed search is a success");
                        return
                    };
                    }catch{
                        console.log("checking for failed search is a success");
                        return
                    };

                    search_books[search_count] = {
                        cover: book_cover,
                        title: book_title,
                        author: book_author
                    };

                    search_count++

                    console.log(
                        "results of search: ","\n",
                        "book covers: ", book_cover, "\n",
                        "book titles: ", book_title, "\n",
                        "book authors: ", book_author, "\n","\n",
                        "search_count: ", search_count, "\n",
                    );
                    
                //build sections to display book info in dropdown

                    if (search_count <= 5){

                    search_dropdown[0].style.height = 17 * search_count; 
                         
                    search_list[0].innerHTML += 
                    `
                    <li class="search_item">
                        <img src="https://covers.openlibrary.org/b/OLID/${book_cover}-M.jpg" />
                        <div class="search_book_info" id="search_book_${search_count}">
                            <p class="type_med">${book_title}</p>
                            <p class="type_small">${book_author}</p>   
                        </div>
                    </li>
                    <button class="add_book_btn type_small">Add Book</button>
                    `
                    ;

                };
                    // open dropdown when results are fetched
                    search_dropdown[0].classList.remove("search_dropdown_hide");


                });

                if (search_input === ""){
                    search_dropdown[0].classList.add("search_dropdown_hide");

                } else if (search_count === 0 || search_count === null){
                    search_list[0].innerHTML += 
                    `
                    <li class="search_item">
                        <div class="search_book_info">
                            <p class="type_med">Either the book you are looking for doesn't exist or is mispelled.<br><br> please try again</p>
                        </div>
                    </li>
                    `
                    ;
                    search_dropdown[0].classList.remove("search_dropdown_hide");
                };
                
            } catch (err){
                console.log(err);
            }
        }  
        // add book buttons

        add_book_btns = document.getElementsByClassName("add_book_btn");
        console.log("add_book_btns: ", add_book_btns, "\n");
        for (let i=0; i<add_book_btns.length; i++){
            
        add_book_btns[i].addEventListener("click", () => {add_book_clicked(i)}, true);
        console.log("i is equal to: ", i);
        };
           console.log("search_books array values: ", search_books, "\n");
    };



// new book pop up

    let add_book_btns
    const new_book_ele = document.getElementById("new_book_container");
    const new_book_close_btn = document.getElementById("new_book_close");
    const new_book_info = document.getElementById("new_book_info");
    const new_book_title_value = document.getElementById("book_title_value");
    const new_book_author_value = document.getElementById("book_author_value");
    const new_book_key_value = document.getElementById("book_key_value");

    new_book_close_btn.addEventListener("click",()=>{add_book_clicked("close")});

    async function add_book_clicked(btn){
        //gather existing book keys to compare to 
        let book_keys = [];
        const loaded_book_keys = document.getElementsByClassName("loaded_book_keys");
        for (let i=0; i<loaded_book_keys.length;i++){
            book_keys.push(loaded_book_keys[i].innerHTML);
        };
        console.log("current book keys: ", book_keys);

    
        console.log("button clicked:", add_book_btns[btn],"\n",
                    "button number clicked", btn,
                    );
        if (btn === "close"){
            new_book_ele.classList.add("upsert_book_container_hide");
            console.log("close button clicked")
        }
        else{

            //check if selected book has already been added

            if(book_keys.includes(search_books[btn].cover)===true){
                console.log("duplicate search success")
                //let user know the book has already been added
                let existing_book_search = document.getElementById(`search_book_${btn+1}`);
                existing_book_search.innerHTML = `<p class="type_med"> You have already added this book </p>`;

            } else{ 
                new_book_ele.classList.remove("upsert_book_container_hide");
                console.log("selected book: ", search_books[btn]);
                
                new_book_info.innerHTML = 
                `
                <img src="https://covers.openlibrary.org/b/OLID/${search_books[btn].cover}-L.jpg" />
                    <div class="upsert_book_info">
                        <p class="type_large">${search_books[btn].title}</p>
                        <p class="type_med">${search_books[btn].author}</p>
                    </div>
                    
                `
                ;

                new_book_title_value.innerHTML = search_books[btn].title;
                new_book_author_value.innerHTML = search_books[btn].author;
                new_book_key_value.innerHTML = search_books[btn].cover;
            }
        }
    }

// edit book pop up

    let edit_book_btns
    const edit_book_ele = document.getElementById("edit_book_container");
    const edit_book_close_btn = document.getElementById("edit_book_close");
    const edit_book_info = document.getElementById("edit_book_info");

    //container elements for information
    const edit_book_title_value = document.getElementById("edit_book_title_value");
    const edit_book_author_value = document.getElementById("edit_book_author_value");
    const edit_book_key_value = document.getElementById("edit_book_key_value");
    const edit_book_date_value = document.getElementById("edit_date");
    const edit_book_notes_value = document.getElementById("edit_book_notes");

    //container element for delete button
    const delete_book_key_value = document.getElementById("delete_book_key_value");


    edit_book_close_btn.addEventListener("click",()=>{edit_book_clicked("close")});

    async function edit_book_clicked(btn){

        //get element id
        let current_book = document.getElementsByClassName("hero_ele_0")[0].id;
        let current_book_id = current_book.match(/\d+/g);

        //gather information to fill form
        let book_title = document.getElementById(`loaded_book_title_${current_book_id}`).innerHTML;
        let book_author = document.getElementById(`loaded_book_author_${current_book_id}`).innerHTML;
        let book_key =  document.getElementById(`loaded_book_key_${current_book_id}`).innerHTML;
        let book_status =  document.getElementById(`loaded_book_status_${current_book_id}`).innerHTML;
        let book_notes = document.getElementById(`loaded_book_notes_${current_book_id}`).innerHTML;
        let book_rating = document.getElementById(`loaded_book_rating_${current_book_id}`).innerHTML;
        let book_date = document.getElementById(`loaded_book_date_${current_book_id}`).innerHTML;

        console.log("current book title:", book_title,"\n",
                    "current book author:", book_author,"\n",
                    "current book key:", book_key,"\n",
                    "current book status:", book_status,"\n",
                    "current book notes:", "\n",
                    "current book rating:", book_rating,"\n",
                    "current book date:", book_date,"\n",
                    );
        if (btn === "close"){
            edit_book_ele.classList.add("upsert_book_container_hide");
            console.log("close button clicked")
        }
        else{
        edit_book_ele.classList.remove("upsert_book_container_hide");
        
        //setting values for basic book info
        edit_book_info.innerHTML = 
        `
        <img src="https://covers.openlibrary.org/b/OLID/${book_key}-L.jpg" />
            <div class="upsert_book_info">
                <p class="type_large">${book_title}</p>
                <p class="type_med">${book_author}</p>
            </div>
            
        `
        ;

        //setting value for status
        let edit_book_status_value = document.getElementById(`edit_${book_status}`)
        edit_book_status_value.checked = true;

        //setting the value for rating
        try{
        book_rating = book_rating.substring(1,2);
        let edit_book_rating_value = document.getElementById(`edit_rate_${book_rating}`);
        console.log("check rating: ",edit_book_rating_value);
        edit_book_rating_value.checked = true;
        }catch{}
  
        //setting the value for the date
        try{
        let iso_book_date = new Date(book_date).toISOString().slice(0,10);
        console.log(iso_book_date);
        edit_book_date_value.value = iso_book_date;
        }catch{}
       
        try{
        edit_book_notes_value.value = book_notes;
        }catch{}
        
        //setting title, author and hidden book key value
        edit_book_title_value.innerHTML = book_title;
        edit_book_author_value.innerHTML = book_author;
        edit_book_key_value.innerHTML = book_key;
        
        //setting book key value for delete button
        delete_book_key_value.innerHTML = book_key;

        }
    }    

// hero slide buttons

hero_books_arrangement()
  
    const left_btn =document.getElementById("hero_slide_btn_left");
    const right_btn =document.getElementById("hero_slide_btn_right");

    right_btn.addEventListener("click",()=>{hero_btn_clicked(0)});
    left_btn.addEventListener("click",()=>{hero_btn_clicked(1)});

    let hero_eles = document.getElementsByClassName("hero_ele");

    console.log( "the hero elements: ", hero_eles, "\n",);

function hero_btn_clicked(adjust){
    console.log ("\n","\n","FUNCTION: hero_btn_clicked", "\n", "\n");

    const current_eles = [];
    for (let i=0; i < 7; i++){
     current_eles.push( document.getElementsByClassName(`hero_ele_${i}`)[0]);
    };

    console.log("the current elements: ", current_eles);
    let hero_eles_amt = hero_eles.length-1;
    console.log("amount of hero elements: ", hero_eles_amt);
    let hero_eles_amt_adjust
    let ele_change_adjust

    if(hero_eles_amt === 0){return};


    for (let i=0; i < hero_eles.length; i++){
        let ele_change
        if (adjust === 0){
            //right click
            if(hero_eles_amt % 2 !== 0 ){
                console.log("odd");
                hero_eles_amt_adjust = hero_eles_amt-1;
                ele_change_adjust = 2; 
            } else {
                hero_eles_amt_adjust = hero_eles_amt;
                ele_change_adjust = 0; 
            };
            //right click element adjust less than 8 elements
            if(i === hero_eles_amt_adjust ){
                current_eles[i].classList.add("hero_ele_move");
                switch(i){
                    case 0:
                        ele_change = 1;
                        break;
                    case 2:
                        ele_change = 1 + ele_change_adjust;
                        break;
                    case 4:
                        ele_change = 3 + ele_change_adjust;
                        break;
                    case 6:
                        ele_change = 5 + ele_change_adjust;
                        break;
                };
            //right click regular element adjust    
            } else{ 
                current_eles[i].classList.remove("hero_ele_move"); 
                switch(i){
                    case 1:
                        ele_change = i - 1;
                        break;
                    case 0: 
                    case 2:
                    case 4: 
                        ele_change = i + 2;
                        break;
                    case 6:
                        ele_change = i + 1;
                    break;
                    case 3:
                    case 5:
                    case 7:
                        ele_change = i - 2;
                    break;
                };
            };
            
            console.log("right click","\n",);
       
        } else  if (adjust === 1){
            //left click
            if(hero_eles_amt % 2 == 0 ){
                console.log("even");
                hero_eles_amt_adjust = hero_eles_amt-1;
                ele_change_adjust = 2; 
            } else {
                hero_eles_amt_adjust = hero_eles_amt;
                ele_change_adjust = 0;
            };

            //left click element adjust with less than 8 elements
            if(i === hero_eles_amt_adjust ){
                console.log("less than 8 elements, amt of elements = ", hero_eles_amt_adjust);
                current_eles[i].classList.add("hero_ele_move");
                switch(i){
                    case 1:
                        ele_change = 0 + ele_change_adjust;
                        break;
                    case 3:
                        ele_change = 2 + ele_change_adjust;
                        break;
                    case 5:
                        ele_change = 4 + ele_change_adjust;
                        break;
                };
            //left click regular element adjust    
            } else{
                current_eles[i].classList.remove("hero_ele_move");     
                switch(i){
                    case 0:
                        ele_change = i + 1;
                        break;
                    case 2:
                    case 4:
                    case 6:         
                        ele_change = i - 2;
                        break;
                    case 1:
                    case 3:
                    case 5:
                        ele_change = i + 2;
                    break;
                };
            };
        
            console.log("left click","\n",);

        };
        console.log("ele_change value:", ele_change, "\n",)
        console.log("ending i value: ", i,"\n",
        "the ending element: ", current_eles[i], "\n","\n",
        );

        if (current_eles[i] !== undefined){
            current_eles[i].classList.add(`hero_ele_${ele_change}`);
            current_eles[i].classList.remove(`hero_ele_${i}`);
            
            };

        
    };

    book_details_remove()

    hero_books_arrangement()

    console.log ("\n","\n","FUNCTION FINISHED: hero_btn_clicked", "\n", "\n");
}



/* doesn't work, consider implimenting later

//add event listener to each Hero book
async function hero_books_listeners(){
    console.log ("\n","\n","FUNCTION: hero_books_listeners", "\n", "\n");

    let hero_eles = Array.from(document.getElementsByClassName("hero_ele"));
    console.log(hero_eles);
    hero_eles.forEach(ele =>{


        ele.removeEventListener("click",call_func,true);
       
        if(ele !== hero_eles[0]){
            console.log(ele);
            let ele_id = ele.id.match(/\d+/g);
            console.log(ele_id[0]);
            //function to pass ele clicks
            function call_func(){
                hero_books_rearrange(ele_id[0]);
            }

            ele.addEventListener("click",call_func,true);
            
        };
    });
    console.log ("\n","\n","FUNCTION FINISHED: hero_books_listeners", "\n", "\n");
}

*/

//function for keeping track of the arrangemnt of the hero books 

async function hero_books_arrangement(){

    
    console.log ("\n","\n","FUNCTION: hero_books_arrangement", "\n", "\n");
    //array for book arrangement ids
    let hero_books =[];

    // update current arrangement of hero books
    let book_0 =0;
    let book_1 =0;
    let book_2 =0;
    let book_3 =0;
    let book_4 =0;
    let book_5 =0;
    let book_6 =0;

    let hero_eles = document.getElementsByClassName("hero_ele");

    for(let i=0; i< hero_eles.length; i++){
        switch(i){
            case 0:
            book_0 = document.getElementsByClassName("hero_ele_0")[0].id.match(/\d+/g)[0];
            break;
            case 1:
            book_1 = document.getElementsByClassName("hero_ele_1")[0].id.match(/\d+/g)[0];
            break;
            case 2:
            book_2 = document.getElementsByClassName("hero_ele_2")[0].id.match(/\d+/g)[0];
            break;
            case 3:
            book_3 = document.getElementsByClassName("hero_ele_3")[0].id.match(/\d+/g)[0];
            break;
            case 4:
            book_4 = document.getElementsByClassName("hero_ele_4")[0].id.match(/\d+/g)[0];
            break;
            case 5:
            book_5 = document.getElementsByClassName("hero_ele_5")[0].id.match(/\d+/g)[0];
            break;
            case 6:
            book_6 = document.getElementsByClassName("hero_ele_6")[0].id.match(/\d+/g)[0];
            break;
        };
    };

    //array for book arrangement ids
    hero_books = [book_0,book_1,book_2,book_3,book_4,book_5,book_6];

    console.log("current arrangement of hero books: ",hero_books);

    console.log ("\n","\n","FUNCTION FINISHED: hero_books_arrangement", "\n", "\n");
    return hero_books;

}

//function to re-arange the hero books
async function hero_books_rearrange(target_book_id){
    console.log ("\n","\n","FUNCTION: hero_books_rearrange", "\n", "\n");

    let hero_books = await hero_books_arrangement();
    console.log("hero_books", hero_books);
    console.log("target book id: ",target_book_id);


    if (hero_books.includes(target_book_id[0]) === true){
        // if book exists in hero section

        
        let existing_book = hero_books.indexOf(target_book_id[0]);
        console.log("existing book location: ", existing_book);

             switch (existing_book){
                case 6:
                    hero_btn_clicked(1);hero_btn_clicked(1);hero_btn_clicked(1);
                break;
                case 4:
                    hero_btn_clicked(1);hero_btn_clicked(1);
                break;
                case 2:
                    hero_btn_clicked(1);
                break;
                case 1:
                    hero_btn_clicked(0);
                break;
                case 3:
                    hero_btn_clicked(0);hero_btn_clicked(0);
                break;
                case 5:
                    hero_btn_clicked(0);hero_btn_clicked(0);hero_btn_clicked(0);
                break;
            };
          
        
        console.log("book: ", target_book_id, "is already in hero section");

    }else{
        //if book doesn't exist in hero section

        //get library book image
        const book_img = document.getElementById(`loaded_book_key_${target_book_id}`).innerHTML;
            
        //change id to library book id, and change image
        const center_ele = document.getElementsByClassName("hero_ele_0")[0];
        center_ele.id = `book_id_${target_book_id}`
        center_ele.innerHTML = `<img src="https://covers.openlibrary.org/b/OLID/${book_img}-L.jpg" />`;

            console.log("book: ", target_book_id, "is not in hero section");
        };
        hero_details_click(0)

    console.log ("\n","\n","FUNCTION FINISHED: hero_books_rearrange", "\n", "\n");
}



// book details hide function
async function book_details_remove(){
    //remove notes display from previously center element
    const notes_ele = document.getElementsByClassName("book_details_show")[0];
    if (notes_ele !== undefined){
    notes_ele.classList.remove("book_details_show");
    };
}


//book details show function
async function book_details_show(){

    //only extract numbers from the string
    const center_book = document.getElementsByClassName("hero_ele_0")[0].id;
    current_book_id = center_book.match(/\d+/g);
    console.log("current center element id:", current_book_id, );
    const center_notes = document.getElementById(`book_details_${current_book_id}`);

    //add notes display to current center element
    center_notes.classList.add("book_details_show");
}

//run function on initial load
book_details_show()

// book details flip button tracking and functionality

    //fetch initial center element & add initial event listeners
    let center_ele = document.getElementsByClassName("hero_ele_0")[0];
    center_ele.addEventListener("mouseover", hero_details_hover);
    center_ele.addEventListener("mouseout", hero_details_hover);

    //function to pass center ele clicks
    function center_ele_click(){
        hero_details_click(0);
    }
    center_ele.addEventListener("click",center_ele_click);

    //details element fetch
    const details_ele = document.getElementsByClassName("hero_ele_details")[0];
        
    //details btn fetch
    const details_btn = document.getElementsByClassName("hero_details_btn")[0];
    details_btn.addEventListener("click",center_ele_click);
    details_btn.addEventListener("mouseover", hero_details_hover);
    details_btn.addEventListener("mouseout", hero_details_hover);

    //details close & edit buttons
    const details_edit_btn = document.getElementsByClassName("edit_book_btn")[0];
    const details_close_btn = document.getElementsByClassName("close_details_btn")[0];
    details_edit_btn.addEventListener("click",edit_book_clicked);
    details_close_btn.addEventListener("click",() =>{hero_details_click(1)});

    //right_btn & left_btn are defined in hero slide buttons section
    right_btn.addEventListener("click",()=>{center_ele_track(0)});
    left_btn.addEventListener("click",()=>{center_ele_track(1)});


    //close on hero slide arrow click
    function center_ele_track(adjust){
        console.log ("\n","\n","FUNCTION: center_ele_track", "\n", "\n");
        console.log("current center element: ", center_ele);

        let hero_eles = document.getElementsByClassName("hero_ele");

        if(hero_eles.length !== 1){
            //remove hover event listener from element when clicking left or right
            if (adjust === 1){
                //left click
                details_ele.classList.add("hero_ele_1");
                document.getElementsByClassName("hero_ele_1")[0].removeEventListener("mouseover", hero_details_hover);
                document.getElementsByClassName("hero_ele_1")[0].removeEventListener("mouseout", hero_details_hover);
                document.getElementsByClassName("hero_ele_1")[0].removeEventListener("click", center_ele_click);

            } else{
                //right click
                details_ele.classList.add("hero_ele_2");
                document.getElementsByClassName("hero_ele_2")[0].removeEventListener("mouseover", hero_details_hover);
                document.getElementsByClassName("hero_ele_2")[0].removeEventListener("mouseout", hero_details_hover);
                document.getElementsByClassName("hero_ele_2")[0].removeEventListener("click",center_ele_click);
            }
    
            details_ele.classList.remove("hero_ele_details_close");
            details_ele.classList.add("hero_ele_details_hide");

            center_ele = document.getElementsByClassName("hero_ele_0")[0];
            center_ele.addEventListener("mouseover", hero_details_hover);
            center_ele.addEventListener("mouseout", hero_details_hover);
            center_ele.addEventListener("click",center_ele_click);
        };

        details_ele.classList.add( "hero_ele_details_close");
        details_edit_btn.classList.add("details_btn_close");
        details_close_btn.classList.add("details_btn_close");

        console.log ("\n","\n","FUNCTION FINISHED: center_ele_track", "\n", "\n");
 
    }

    //details button show/hide
    function hero_details_hover(){
      details_btn.classList.toggle("hero_details_btn_hide");
    }

    //on click actions
    function hero_details_click(btn){

        console.log ("\n","\n","FUNCTION: hero_details_click", "\n", "\n");
        console.log("current center element: ", center_ele);
        details_ele.classList.remove("hero_ele_2", "hero_ele_1", "hero_ele_details_hide");
        if (btn === 0){
            details_ele.classList.remove("hero_ele_details_close");
            details_edit_btn.classList.remove("details_btn_hide");
            details_close_btn.classList.remove("details_btn_hide");
            details_edit_btn.classList.remove("details_btn_close");
            details_close_btn.classList.remove("details_btn_close");
        } else if (btn === 1){
            details_ele.classList.add("hero_ele_details_close");
            details_edit_btn.classList.add("details_btn_hide");
            details_close_btn.classList.add("details_btn_hide");
        };
        book_details_show()
        console.log ("\n","\n","FUNCTION FINISHED: hero_details_click", "\n", "\n");
    }
    
   
        
    

// collapsable buttons for libraries

    const btns = document.getElementsByClassName("library_btn");
    const libraries = document.getElementsByClassName("library_container")
    const libraries_container = document.getElementsByClassName("libraries_container")

    btns[0].addEventListener("click",()=>{library_btn_clicked(0)});
    btns[1].addEventListener("click",()=>{library_btn_clicked(1)});
    btns[2].addEventListener("click",()=>{library_btn_clicked(2)});

    function library_btn_clicked(id){
        console.log(id);
        btns[id].classList.toggle("library_btn_current");
        libraries[id].classList.toggle("library_open");

        for (i = 0; i<btns.length; i++){
            if (i !== id){
            
                btns[i].classList.remove("library_btn_current");
                libraries[i].classList.remove("library_open");
            }
        };

        let active_btn = document.getElementsByClassName("library_btn_current");

        if (active_btn.length !== 0){
            libraries_container[0].classList.add("library_open");
        } else {
        
            libraries_container[0].classList.remove("library_open");
        }
    } 


//move library book to hero

    //add event listener to each library book
    const library_books = document.getElementsByClassName("library_ele");

    for(let i=0; i < library_books.length; i++){
       let current_book = library_books[i].id;
       let current_book_id = current_book.match(/\d+/g);

       library_books[i].addEventListener("click",() => {library_book_click(current_book_id)});
    };

    //function for when library book is clicked
    async function library_book_click(book_id){

        console.log ("\n","\n","FUNCTION: library_book_click", "\n", "\n");

        book_details_remove()

        await hero_books_rearrange(book_id)
    
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
          });

        
        console.log ("\n","\n","FUNCTION FINISHED: library_book_click", "\n", "\n");
    }
   
   






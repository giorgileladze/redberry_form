"use strict";

// html elements 
const slideContainer = document.querySelector(".slide_container");
const slidesCollection = document.querySelectorAll('.slides');
const dotContainer = document.querySelector('.dot_container');
const dots = document.querySelectorAll('.dots');
const submitBtn = document.querySelector('.submit_btn');
const inputFirstName = document.querySelector('#f_name');
const inputLastName = document.querySelector('#l_name');
const inputEmail = document.querySelector('#email');
const inputTel = document.querySelector('#phone');
const skillsDropdown = document.querySelector('#skills');
const addskill = document.querySelector('.add_skill');
const expDuration = document.querySelector('#exp-duration');
const skillsContainer = document.querySelector('.skills_container');
const workpref = document.getElementsByName('work_ap');
const hadcovid = document.getElementsByName('covid_history');
const vacc_history = document.getElementsByName('vacc_history');
const covData = document.querySelector('.input-cov_data');
const vaccData = document.querySelector('.input-vacc_data');
const devQues = document.getElementsByName('attend');
const txtarea_1 = document.querySelector('#txt-area_1');
const txtarea_2 = document.querySelector('#txt-area_2');
const headline = document.querySelector('#txt-area_1_headline');
const message_bar = document.querySelector(".message");
const messageContaine = document.querySelector(".message_container");
const work_pref = document.querySelector("#work_pref");
const cov_hist = document.querySelector("#cov_hist");
const vacc_hist = document.querySelector("#vacc_hist");
const devtalks_id = document.querySelector("#devtalks_id");


// class
class Main {
	#currentSlide = 1; // variable to save current slide data (starts with slide N1)
	#allSkils = [];
	
	// all user input data 
	#token = '31ac7cd6-e97e-4ad0-84c3-fbb5e57954a8';
	#firstName;
	#lastName;
	#email;
	#phone;
	#skills = [];
	#work_preference;
	#had_covid;
	#had_covid_at = false;
	#vaccinated;
	#vaccinated_at = false;
	#will_organize_devtalk;
	#devtalk_topic;
	#something_special;
	
	constructor(){
		this._createDots();
		this._activateDots();
		this._setPositions();
		this._getSkills();
		dotContainer.addEventListener('click', (e) => { // event to move to slide
			if(e.target.closest(".dot_container")) this._goToSlide(e.target.dataset.slide); 
		});
		document.querySelector(".go-back_btn").addEventListener('click', () => {this._goToSlide(4)}) // return to prev slide (N4)
		addskill.addEventListener('click', this._addNewSkill.bind(this)); // listen to skill-add btn
		skillsContainer.addEventListener('click', (e) => {this._removeSkill(e.target)}); // listen to skill-remove btn
		hadcovid.forEach(elem => elem.addEventListener('click', (e) => {this._displayCovData(e.target.id)})); // add data input depended user answer
		vacc_history.forEach(elem => elem.addEventListener('click', (e) => {this._displayVaccData(e.target.id)})); //add data, depended user answer
		devQues.forEach(elem => elem.addEventListener("click", (e) => {this._displayTopic(e.target.id)})); 
		submitBtn.addEventListener('click', this._sendDataToApi.bind(this)); // listen to submit btn
	}
	
	_setPositions(){
		slidesCollection.forEach((elem, i) => {
			elem.dataset.id = `${i + 1}`;
			elem.style.transform = `translate(-110%)`;
			if(elem.dataset.id == this.#currentSlide) elem.style.transform = `translate(0%)`;
		});
	}
	
	_createDots(){
		slidesCollection.forEach((_, i) => { // create dots depended on num of slides
			dotContainer.insertAdjacentHTML('beforeend', `<button class="dots" data-slide="${i + 1}"></button>`);});
			dotContainer.insertAdjacentHTML('beforeend', `<img src="Next.png" class="dots_arrow" data-slide="next">`); // add next-slide btn
			dotContainer.insertAdjacentHTML('afterbegin', `<img src="Previous.png" class="dots_arrow" data-slide="prev">`); // add prev-slide btn
	}
	
	_activateDots(){
		document.querySelectorAll('.dots').forEach((elem) => { // change opacity of active & nonactive btns
			elem.style.opacity = 1; 
			if(elem.dataset.slide > this.#currentSlide) elem.style.opacity = 0.4;
		});
	}
	
	_goToSlide(index){
		if(index == "prev" && this.#currentSlide == 1) location.href = 'index.html';
		
		//////////// steatments to control slider
		if(index == "next" && this.#currentSlide < 5) this._isValid() //check to move to next
		if(index == "prev" && this.#currentSlide > 1) this.#currentSlide--; // move to prev
		if(index > this.#currentSlide) return; // check btn to move (prevent jump on slides)
		if(index != "next" && index != "prev") this.#currentSlide = +index // move to index (btn)
		
		slidesCollection.forEach(elem => {
			elem.style.transform = `translate(${-110}%)`;
			if(elem.dataset.id == this.#currentSlide) elem.style.transform = `translate(${0}%)`;
		});
		this._activateDots(); 
		if(this.#currentSlide == 5) dotContainer.classList.add("hidden");
		else dotContainer.classList.remove('hidden');
	}
	
	_getSkills(){
		fetch('https://bootcamp-2022.devtest.ge/api/skills')
		.then((response) => response.json())
		.then(data => {
			data.forEach((elem) => {
				const html = `<option data-id="${elem.id}" value="${elem.title}">${elem.title}</option>`;
				skillsDropdown.insertAdjacentHTML("beforeend", html);
				this.#allSkils.push(elem);
			});
		}).catch((error) => {
				console.error(`something has happend! ${error}`)
				alert("unable to connect server! please check your network connection!");
		}); 
	}
	
	_addNewSkill(){
		const {id} = this.#allSkils.find(elem => elem.title == skillsDropdown.value);
		const duration = (expDuration.value > 0 && expDuration.value) || 1;
						  /* ((expDuration.value > 0 && expDuration.value) || 1) ---- using this operators one lines up i calculated automaticali dafault value (1) of exp-duration and set it to list when the user didnot add or add negativ number for exp-duratian */
		const newskill = {
			id,
			'experience': duration
		};
		// check current skills
		if(!this.#skills.find(elem => elem.id == id)) {
			this.#skills.push(newskill);
			const html = `<div class="skills">
							 <h6>${skillsDropdown.value}</h6>
							 <h6>Years of Experience: ${duration}</h6> 
							 <img src="Remove.png" class="remove_btn">
						  </div>`;  
			skillsContainer.insertAdjacentHTML("afterbegin", html);
		}
		else alert('this skill is already added!');
	}
	
	_removeSkill(elem){
		if(elem.classList.contains("remove_btn")) {
			elem.closest(".skills").remove();
			const text = elem.closest(".skills").firstElementChild.textContent; // name of removed skill
			const {id} = this.#allSkils.find(el => el.title == text); // get skill id
			const skill = this.#skills.find(el => el.id == id); // find this skill in our skill arr
			this.#skills.splice(this.#skills.indexOf(skill), 1); // remove this skill by its index
		}
	}
	
	_displayTopic(id){
		if(id == "attend") {
			txtarea_1.classList.remove("hidden");
			headline.classList.remove("hidden");
		}
		else {
			txtarea_1.classList.add("hidden");
			headline.classList.add("hidden");
		}
	}	
	
	_thanksPage(){
		location.href = 'thank_page.html';
		
		setTimeout(() => {location.href = 'index.html'}, 3000);
	}
	
	_isValid(){ // get correct page dto validate
		if(this.#currentSlide == 4) this._page4();
		if(this.#currentSlide == 3) this._page3();
		if(this.#currentSlide == 2) this._page2();
		if(this.#currentSlide == 1) this._page1();
	}
	
	_page1(){ // check page N1 validaition
		this.#firstName = inputFirstName.value;
		this.#lastName = inputLastName.value;
		this.#email = inputEmail.value;
		this.#phone = inputTel.value.split(' ').join('').split('-').join('');
		
		if(this.#firstName.length < 2) return this._displayMessage("First name should be at last 2 letter", inputFirstName);
		if(this.#lastName.length < 2) return this._displayMessage("Last name should be at last 2 letter", inputLastName);
		if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.#email)) return this._displayMessage("invalid Email", inputEmail);
		if(!(this.#phone.slice(0, 4) == '+995' && this.#phone.length == 13) && this.#phone.length != 0) return this._displayMessage("invalid phone! you can skip this step", inputTel);;
		
		return this.#currentSlide++;
	}
	
	_page2(){ // check page N2 validation
		if(this.#skills.length == 0) return alert("You should choose at last 1 skill!");
		return this.#currentSlide++;
	}
	
	_page3(){ // check page N3 validation
		for(let i = 0; i < workpref.length; i++){ // check if user choose answer
			if (workpref[i].checked) {
			 this.#work_preference = workpref[i].value; // save choosen answer
			 break;
			 }
		}
		for(let i = 0; i < hadcovid.length; i++){ // check if user choose answer
			if (hadcovid[i].checked) {
			 this.#had_covid = hadcovid[i].value; 
			 break;
			 }
		}
		for(let i = 0; i < vacc_history.length; i++){ // check if user choose answer
			if (vacc_history[i].checked) {
			 this.#vaccinated = vacc_history[i].value; 
			 break;
			 }
		}
		if(!this.#work_preference) return this._displayMessage("Please choose one of them", work_pref);
		
		if(!this.#had_covid) return this._displayMessage("Please choose one of them", cov_hist);
		if(covData.value === '' && this.#had_covid == "Yes") return this._displayMessage("you should fill this fild", covData);
		
		if(!this.#vaccinated) return this._displayMessage("Please choose one of them", vacc_hist);
		if(vaccData.value === '' && this.#vaccinated == "Yes") return this._displayMessage("you should fill this fild", vaccData);
				
		if(this.#had_covid == "Yes") this.#had_covid_at = covData.value;
		if(this.#vaccinated == "Yes") this.#vaccinated_at = vaccData.value;
		
		return this.#currentSlide++;
	}
	
	_page4(){ // check page N4 validation
		for(let i = 0; i < devQues.length; i++){ 
			if (devQues[i].checked) {
			 this.#will_organize_devtalk = devQues[i].value; // save choosen answer
			 break;
			 }
		}
		if(this.#will_organize_devtalk === undefined) return this._displayMessage("You should choose one of this two answer", devtalks_id);
		
		if(txtarea_1.value.length < 20 && this.#will_organize_devtalk == "Yes") return this._displayMessage("You should fill this textarea!", txtarea_1);
		if(txtarea_2.value.length < 20) return this._displayMessage("You should fill this textarea!", txtarea_2);
		
		this.#devtalk_topic = txtarea_1.value; // save value
		this.#something_special = txtarea_2.value; // save value
		
		return this.#currentSlide++;
	}
	
	_userFriendli_textarea(){ // display curent num of simbols user wrote and min/max limits 
		
	}
	
	_displayCovData(id){ // had-covid data
		const elem = document.querySelector("#data_1");
		if(id == 'had_cov') elem.classList.remove('hidden');
		else elem.classList.add('hidden');
	}
	
	_displayVaccData(id){ // vaccinated data
		const elem = document.querySelector("#data_2");
		if(id == 'vaccinated') elem.classList.remove('hidden');
		else elem.classList.add('hidden');
	}
	
	_displayMessage(message, elem){ // display userfriendly error message to show where the validation has failed
		const {top, left} = elem.getBoundingClientRect() // get position of element
		
		messageContaine.classList.remove('hidden');
		messageContaine.style.transform = `translate(${left}px, ${top - 25}px)`
		message_bar.textContent = `${message}`;
		
		setTimeout(() => {
			messageContaine.classList.add('hidden'); // remove arror message after 3s
		}, 3000);
	}
	
	
	_sendDataToApi(){ // this part is no working :)
		const strData = {
		  "token": this.#token,
		  "first_name": this.#firstName,
		  "last_name": this.#lastName,
		  "email": this.#email,
		  "phone": this.#phone,
		  "skills": this.#skills,
		  "work_preference": this.#work_preference,
		  "had_covid": true,
		  "had_covid_at": this.#had_covid_at,
		  "vaccinated": true,
		  "vaccinated_at": this.#vaccinated_at,
		  "will_organize_devtalk": true,
		  "devtalk_topic": this.#devtalk_topic,
		  "something_special": this.#something_special
		}
		console.log(JSON.stringify(strData));
		
		fetch("https://bootcamp-2022.devtest.ge/api/application?token=31ac7cd6-e97e-4ad0-84c3-fbb5e57954a8", {
			method: 'POST', 
			mode: "no-cors",
		   body: JSON.stringify(strData),
		   headers: {
			 'Content-Type': 'application/json; charset=UTF-8',
			 'Accepet': "application/json"
		   },
		})
		.catch(error => console.error('Something went wrong.', error));
		
		
		this._thanksPage();
	}
}

const app = new Main();



















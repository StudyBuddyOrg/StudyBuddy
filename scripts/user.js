import {Student} from "../sort.js";

export class User {

    /**
     *
     * @param json_data
     * @param {string} json_data.first_name
     * @param {string} json_data.last_name
     * @param {string} json_data.email
     * @param {number} json_data.semester
     * @param {string} json_data.gender
     * @param {Array} json_data.interests
     * @param {string} json_data.major
     * @param {string} json_data.study_style
     * @param {Object} json_data.time_available
     *
     */
    constructor(json_data) {
        this.first_name = json_data.first_name;
        this.last_name = json_data.last_name;
        this.email = json_data.email;
        this.semester = json_data.semester;
        this.gender = json_data.gender.toLowerCase();
        this.interests = json_data.interests.map(item => item.toLowerCase());
        this.major = json_data.major.toLowerCase().replace(' ', '_');
        this.study_style = json_data.study_style.toLowerCase();
        this.time_availible = json_data.time_availible.toLowerCase();
    }

    get_signup_data() {
        return {first_name: this.first_name,
        last_name: this.last_name,
        email: this.email,
        semester: this.semester,
        gender: this.gender,
        interests: this.interests,
        major: this.major,
        study_style: this.study_style,
        time_availible: this.time_availible}
    }

    get_signup_data_json() {
        return JSON.stringify(this);
    }

    getStudent(){
        return new Student(this.time_availible, this.study_style, this.major, this.interests, this.semester);
    }

}

export default User;
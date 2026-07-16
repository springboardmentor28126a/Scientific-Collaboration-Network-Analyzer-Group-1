import axios from "axios";

async function testLogin() {
    try {
        const formData = new URLSearchParams();
        formData.append("username", "test@test.com"); // Assuming there is a test user
        formData.append("password", "testpassword");
        
        const response = await axios.post("http://127.0.0.1:8000/login", formData, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            }
        });
        console.log("Login Success:", response.data);
    } catch (e) {
        console.log("Login Failed:", e.response?.data || e.message);
    }
}
testLogin();

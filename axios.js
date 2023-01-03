
const getBtn = document.getElementById('read-data');




const linkAPI_GETCAR = 'http://localhost:3000/cars';
const linkAPI_GETCAR2 = 'http://localhost:3000/available-cars'
//const linkAPI_UPLOAD = 'http://localhost:3000/upload'

// const linkAPI_GET = 'https://handsome-pink-sparrow.cyclic.app/getpost';
// const linkAPI_POST = 'https://handsome-pink-sparrow.cyclic.app/add/post'
// const linkAPI_UPLOAD = 'https://handsome-pink-sparrow.cyclic.app/upload'

const getdata = () => {
    axios.get(linkAPI_GETCAR).then(response => {
        console.log(response);

        //length.innerHTML = response.data.data.length;
        //status1.innerHTML = response.status;
        //statusText1.innerHTML = response.statusText;
        //message1.innerHTML = response.data.message + " | Length : " + response.data.data.length;
    });
};
getBtn.addEventListener('click', getdata);

//upload file


/* axios.post(linkAPI_POST,
        {
            "title": "1",
            "content": "2",
            "contentHtml": "3",
            "hidden": "4",
            "createdAt": "5",
            "updatedAt": "6",
            "authorId": "7"
        },
        {
            headers: {
                //"Botnoi-Token": "e5ae8fdc3d2992c44694f127331858adb2c3126faa6cb827ad9389d1b12399d7",
                'Content-Type': 'application/json'
            }
        })
        .then(response => {

            console.log(response);

            status2.innerHTML = response.status;
            //statusText2.innerHTML = response.statusText;
            message2.innerHTML = response.data.message;

            alert("บันทึกข้อมูลเรียบร้อย");


        })
        .catch(err => {
            console.error(err)
        }); */

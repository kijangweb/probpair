const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Node 18+ fetch global
const app = express();
app.use(bodyParser.json());
app.use(express.static('.'));

const VALID_PIN = "1234"; // cocok dengan secrets UPDATE_PIN
const REPO = "kijangweb/probpair";
const WORKFLOW_ID = "update-data.yml";
const MAIN_BRANCH = "main";
const GITHUB_PAT = process.env.GH_PAT; // simpan token di environment

app.post('/update-json', async (req,res)=>{
  const {pin,datajson} = req.body;
  if(pin !== VALID_PIN) return res.json({success:false,message:"PIN salah"});
  try{
    const r = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW_ID}/dispatches`,{
      method:"POST",
      headers:{
        "Accept":"application/vnd.github+json",
        "Authorization":`token ${GITHUB_PAT}`,
        "Content-Type":"application/json"
      },
      body: JSON.stringify({ref: MAIN_BRANCH, inputs:{pin,datajson}})
    });
    if(r.ok) res.json({success:true});
    else res.json({success:false,message:await r.text()});
  }catch(err){
    res.json({success:false,message:err.message});
  }
});

app.listen(3000,()=>console.log("Server siap di http://localhost:3000"));

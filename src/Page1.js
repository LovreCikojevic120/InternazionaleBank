import "./Page1CSS.css";
import { Link, Redirect } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import jsPDF from "jspdf";
import domtoimage from 'dom-to-image';


export default function Page1() {

    const mySubmitHandler = async (event) => {
        event.preventDefault();
        const uplataName = document.forms["uplata"]["username"].value;
        const uplataValue = document.forms["uplata"]["value"].value;
        const uplataPassword = document.forms["uplata"]["password"].value;
        const body = { iban: uplataName, value: uplataValue, password: uplataPassword, uplatitelj: name };
        if (uplataName.trim().length > 0 && uplataPassword.trim().length > 0 && uplataValue.trim().length > 0 && uplataValue > 0) {
            try {
                const response = await fetch("http://localhost:5000/uplata", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                });
                const parseRes = response.status;
                if (parseRes === 200) {
                    alert("Uspjeh");
                } else if (parseRes === 403) {
                    alert("Krivi iznos");
                } else if (parseRes === 402) {
                    alert("Kriva lozinka");
                } else {
                    alert("Krivi broj racuna")
                }
            } catch (error) {
                console.error(error.message);
            }
        } else {
            alert("Krivo upisan iznos");
        }
    }

    const [name, setName] = useState("");

    async function getName() {
        try {
            const response = await fetch("http://localhost:5000/page1", {
                method: "GET",
                headers: { token: localStorage.token }
            });

            const parseRes = await response.json();
            setName(parseRes.username);
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        getName();
    }, []);

    const [iban, setIban] = useState("");

    async function getIban() {
        try {
            const response = await fetch("http://localhost:5000/iban", {
                method: "GET",
                headers: { token: localStorage.token }
            });

            const parseRes = await response.json();
            setIban(parseRes.iban);
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        getIban();
    },[]);

    const [balance, setBalance] = useState("");

    async function getBalance() {
        try {
            const response = await fetch("http://localhost:5000/balance", {
                method: "GET",
                headers: { token: localStorage.token }
            });

            const parseRes = await response.json();
            setBalance(parseRes.stanje);
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        getBalance();
    },[]);

    const [transakcije, setTransakcije] = useState([]);

    async function getTransakcije() {
        const body = { transIme: name };
        const response = await fetch("http://localhost:5000/transakcije", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        let parseRes = await response.json();
        setTransakcije(parseRes);
    }

    useEffect(() => {
        getTransakcije();
    });

    
    function generate(){

        const input = document.getElementById('tablica');
        const pdf = new jsPDF();
            if (pdf) {
              domtoimage.toPng(input).then(imgData => {
                   pdf.addImage(imgData, 'PNG', 20, 10);
                  pdf.save('download.pdf');
                });
            }
    }

    return (
        <div>
            <h1>
                Dobrodošli {name}!
            </h1>
            <ul id="menu">
                <li className="tab"><a href="#tab1">Stanje računa</a></li>
                <li className="tab"><a href="#tab2">Uplate</a></li>
                <li className="tab"><a href="#tab3">Transakcije</a></li>
                <li className="tab"><a href="#tab4">Tečajna lista</a></li>
                <Link to="/" className="tab">Odjava</Link>
            </ul>
            <div id="tab1" className="tab-content">
                <h2>Vaše stanje računa iznosi:</h2>
                <br />
                <span id="balance">{balance} kn</span>

            </div>

            <div id="tab2" className="tab-content">
                 <h2 id="iban">Vaš serijski broj: {iban}</h2>
                 
                <h2>Nova uplata</h2>
                <form name="uplata" onSubmit={mySubmitHandler}>
                    <ul id="mainMenu">
                        <p>Unesi serijski broj primatelja:</p>
                        <input
                            type='text'
                            name='username'
                        />
                        <p>Unesi iznos:</p>
                        <input
                            type='number' min="1" step="any"
                            name='value'
                        />
                        <p>Potvrdi lozinku:</p>
                        <input
                            type='password'
                            name='password'
                        />
                        <input id="loginButton" type='submit' value="Uplati"/>
                    </ul>
                </form>
            </div>
            <div id="tab3" className="tab-content">
                <body>
                 <table>
                     <div id="tablica">
                <tr> 
                &#8287;Iznos&#8287;&#8287;&#8287;&#8287;
                    Serijski broj&#8287;&#8287;&#8287;&#8287;&#8287;&#8287;&#8287;&#8287;&#8287;&#8287;&#8287;
                    &#8287;&#8287;&#8287;&#8287;&#8287;&#8287;&#8287;&#8287;&#8287;
                    Datum
                 </tr>
                {transakcije.map(el => {
                    return (
                        <div key={el.trans_id}>
                         <tr>   
                         <td>{el.suma}</td>
                         <td>{el.iban_primatelj}</td>
                         <td>{el.datum}</td>                                  
                         </tr> 
                        </div>                                      //Ovaj div unutar return-a bi trebalo sredit sa CSSom
                    )                                               //Ova 3 el-a mozete raposredit kako ocete i stavljat ih u svoje div-ove ako zelite
                })}
                </div>
                </table>
                </body> 
                <button onClick={generate}>DOWNLOAD</button>
            </div>
            <div id="tab4" className="tab-content">
                <h2>Tečajni kalkulator</h2>
                <iframe src="https://xeconvert.com/widget1?from=usd&to=eur&lang=&theme=blue&font=12" width="100%" height="300" frameborder="0" scrolling="no"></iframe><div ><a target="_blank" href="https://xeconvert.com/">Tečajni kalkulator</a></div>

            </div>
        </div>
    );

}

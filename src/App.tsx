import React, { useState } from "react";
import { usePapaParse } from "react-papaparse";
import "./App.css";

interface employees {
	EmpID: number;
	ProjectID: number;
	DateFrom: string;
	DateTo: string | null;
}

function App() {
	const [data, setData] = useState<employees[]>([]);
	const [errorsData, setErrorsData] = useState([]);

	const { readString } = usePapaParse();

	const readFileOnUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const fileReader = new FileReader();
		fileReader.onloadend = () => {
			if (fileReader.result !== null) {
				const csvString = String(fileReader.result);

				readString(csvString, {
					worker: true,
					complete: (results) => {
						if (Array.isArray(results.errors)) {
							//@ts-ignore
							setErrorsData(results.errors);
						}
							
						console.log("---------------------------");
						console.log(results);
						console.log("---------------------------");
					},
				});
			}
		};

		if (e.target.files !== null) {
			fileReader.readAsText(e.target.files[0]);
		}
	};

	return (
		<div className="app">
			<div className="fileSection">
				<input
					type="file"
					onChange={readFileOnUpload}
					accept=".csv,.xlsx,.xls"
				/>
			</div>

			<div className="dataGrid">

				{errorsData.length > 0 &&
					<ul>
						{errorsData.map((item, i) => {
							return <li key={i}>{item}</li>
						})}
					</ul>					
				}
			</div>
		</div>
	);
}

export default App;

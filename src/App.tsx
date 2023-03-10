import React, { useState } from "react";
import { usePapaParse } from "react-papaparse";
import "./App.css";

interface employeesPair {
	empID1: number;
	empID2: number;
	projectID: number;
	days: number;
}

interface employeesResult {
	[index: string]: employeesPair;
}

function App() {
	const [dataResult, setDataResult] = useState<employeesResult>({});
	const [topPairOfEmployees, setTopPairOfEmployees] = useState<employeesPair | null>(null);
	const [errorsData, setErrorsData] = useState([]);

	const { readString } = usePapaParse();

	const readFileOnUpload = (e: React.ChangeEvent<HTMLInputElement>) => {	
		const fileReader = new FileReader();

		fileReader.onloadend = () => {
			if (!fileReader.result) {
				return
			}	

			const csvString = String(fileReader.result);

			readString(csvString, {
				worker: true,
				complete: (results) => {
					if (Array.isArray(results.errors)) {
						//@ts-ignore
						setErrorsData(results.errors);
					}
					calculateResult(results.data);											
				},
			});
			
		};

		if (e.target.files !== null) {
			fileReader.readAsText(e.target.files[0]);
		}
	};

	const calculateResult = (data: any) => {
		const mapEmpsPairs: any = {};
		let topPair: employeesPair = {
			empID1: 0,
			empID2: 0,
			projectID: 0,
			days: 0
		};

		for (let i1=0; i1 < data.length; i1++) {
			for (let i2=i1+1; i2 < data.length; i2++) {
				if (data[i1][0] === data[i2][0]) continue;// skip the same employees

				if (data[i1][1] === data[i2][1]) { // if the same project
					const emp1 = parseInt(data[i1][0]);
					const emp2 = parseInt(data[i2][0]);
					const startDate1 = data[i1][2];
					const startEnd1 = data[i1][3];
					const startDate2 = data[i2][2];
					const startEnd2 = data[i2][3];					

					const projectId = parseInt(data[i1][1]);
					const days = getIntersectionDate(startDate1, startEnd1, startDate2, startEnd2);

					if (days > 0) {
						// to prevent inverted pairs					
						let empKey = (emp1 < emp2) ? `${emp1}|${emp2}|${projectId}` : `${emp2}|${emp1}|${projectId}`; 

						let prevData = mapEmpsPairs[empKey];
						let prevDays = 0; 
						if (prevData) {
							prevDays = prevData.days;		
						} 

						mapEmpsPairs[empKey] = {empID1: emp1, empID2: emp2, projectID: projectId, days: days + prevDays};
						
						if (days + prevDays > topPair.days) {
							topPair = {empID1: emp1, empID2: emp2, projectID: projectId, days: days + prevDays};	
						}
					}
				}

			}
		}

		setDataResult(mapEmpsPairs);
		setTopPairOfEmployees(topPair);
	}


	function getIntersectionDate(dateStart1s: string, dateEnd1s: string, dateStart2s: string, dateEnd2s: string): number {
		let dateStart1 = (dateStart1s.toLowerCase().trim() === 'null') ? new Date().getTime() : Date.parse(dateStart1s);
		let dateEnd1 = (dateEnd1s.toLowerCase().trim() === 'null') ? new Date().getTime() : Date.parse(dateEnd1s);
		let dateStart2 = (dateStart2s.toLowerCase().trim() === 'null') ? new Date().getTime() : Date.parse(dateStart2s);
		let dateEnd2 = (dateEnd2s.toLowerCase().trim() === 'null') ? new Date().getTime() : Date.parse(dateEnd2s);			

		if (dateStart1 < dateEnd2 && dateEnd1 > dateStart2) {			
			return Math.floor(((Math.min(dateEnd1, dateEnd2)) - (Math.max(dateStart2, dateStart1))) / (24*60*60*1000)) + 1;
		} else {
			return 0;
		}
	}
	
	return (
		<div className="app">
			<div className="fileSection">
				<input
					type="file"
					onChange={readFileOnUpload}
					accept=".csv,.xlsx,.xls"
				/>
			</div>

			<div className="winner">
				{topPairOfEmployees?.days && topPairOfEmployees?.days > 0 ? 
					<>
						<p>The pair of employees who have worked together on common projects for the longest period of time:</p>
						<br/>
						<p>Employee ID #1: {topPairOfEmployees.empID1}</p>
						<p>Employee ID #2: {topPairOfEmployees.empID2}</p>
						<p>Project ID: {topPairOfEmployees.projectID}</p>
						<p>Days worked: {topPairOfEmployees.days}</p>
					</>
					:
					<p>There is no the pair of employees who worked at the same project at the same time.</p>
				}
			</div>

			<div className="dataGrid">
				<table>
					<tbody>
						<tr>
							<th>Employee ID #1</th>
							<th>Employee ID #2</th>
							<th>Project ID</th>
							<th>Days worked together</th>
						</tr>

						{Object.keys(dataResult).map((key, index) => {
							return (
								<tr key={key}>								
									<td>{dataResult[key].empID1}</td>
									<td>{dataResult[key].empID2}</td>
									<td>{dataResult[key].projectID}</td>
									<td>{dataResult[key].days}</td>
								</tr>
							);
						})}

					</tbody>
				</table>

				{errorsData.length > 0 && (
					<ul>
						{errorsData.map((item, i) => {
							return <li key={i}>{item}</li>;
						})}
					</ul>
				)}
			</div>
		</div>
	);
}

export default App;
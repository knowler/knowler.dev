const professionalExperiences = [
	{
		position: "Senior Frontend Developer",
		company: {
			name: "Kettle",
			website: "https://wearekettle.com",
			location: "San Francisco, CA",
		},
		workingLocation: "Winnipeg, MB",
		type: "contract",
		capacity: "full-time",
		startDate: "2022-02-22",
	},
	{
		position: "Software Developer",
		company: {
			name: "Liquid Web",
			website: "https://liquidweb.com",
			location: "San Diego, CA",
		},
		workingLocation: "Winnipeg, MB",
		type: "permanent",
		capaity: "full-time",
		startDate: "2021-05-01",
		endDate: "2022-02-18",
	},
	{
		position: "Full Stack Developer",
		company: {
			name: "Impress.org",
			website: "https://liquidweb.com",
			location: "San Diego, CA",
		},
		workingLocation: "Winnipeg, MB",
		type: "contract",
		capacity: "full-time",
		startDate: "2019-10-08",
		endDate: "2021-05-01",
	},
	{
		position: "Full Stack Developer",
		company: {
			name: "KM Digital",
			website: "https://k-m.com",
			location: "Leesburg, VA",
		},
		workingLocation: "Calgary, AB",
		type: "contract",
		capacity: "part-time",
		startDate: "2019-01",
		endDate: "2019-07",
	},
	{
		position: "Full Stack Developer",
		company: {
			name: "True Market",
			website: "https://truemarket.ca",
			location: "Calgary, AB",
		},
		type: "contract",
		capacity: "full-time",
		startDate: "2018-01",
		endDate: "2018-12",
	},
];

export function GET({ view }) {
	return view("cv", {
		title: "Curriculum Vitae",
		professionalExperiences,
	});
}

export const pattern = new URLPattern({ pathname: "/cv{/}?" });

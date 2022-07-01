import {getAccessToken} from "./auth";

const endPointURL = 'http://localhost:9000/graphql';


const graphQLRequest = async (query, variables = {}) => {
    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(
            {
                query,
                variables
            }),
    };
    const accessToken = getAccessToken();
    if (accessToken) {
        request.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    const response = await fetch(endPointURL, request);
    const data = await response.json();
    if (data.errors) {
        const messages = data.errors.map(error => error.message);
        throw new Error(messages.join('\n'));
    }
    return data.data;
}

export const createJob = async (input) => {
    const response = await graphQLRequest(
        `mutation CreateJob($input: CreateJobInput!) {
              job: createJob(input: $input) {
                id
                description
                title
                company {
                  id
                  name
                }
              }
            }`,
        { input }
    );
    return response.job;
}


export const loadCompany = async (companyId) => {
    const query = `query CompanyQuery($companyId: ID!) {
  company(id: $companyId) {
    name
    description
    jobs {
      id
      title
      company {
        name
      }
    }
  }
}
                `;
    const response = await graphQLRequest(query, {companyId});
    return response.company;
}


export const loadJob = async (jobId) => {
    const query = `query JobQuery($jobId: ID!) {
                        job(id: $jobId) {
                            id
                            title
                            company {
                                id
                                name
                            }
                            description
                        }
                }`;
    const response = await graphQLRequest(query, {jobId});
    return response.job;

}

export const loadJobs = async (limit) => {
    const query = `query ($limit: Int!) {
                jobs(limit: $limit) {
                    id
                    title
                    company {
                        id
                        name
                    }
                }
            }`;
    const response = await graphQLRequest(query, {limit});
    return response.jobs;

}
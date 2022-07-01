import {getAccessToken} from "./auth";
import {ApolloClient, ApolloLink, gql, HttpLink, InMemoryCache} from "apollo-boost";

const endPointURL = 'http://localhost:9000/graphql';

const authLink = new ApolloLink((operation, forward) => {
    // Retrieve the token from local storage.
    const token = getAccessToken();
    // Use the setContext method to set the authentication token on the client.
    operation.setContext(
        {
            headers: {
                authorization: token ? `Bearer ${token}` : ''
            }
        });
    return forward(operation);
});

const client = new ApolloClient(
    {
        link: ApolloLink.from([authLink, new HttpLink({uri: endPointURL})]),
        cache: new InMemoryCache(),

    });

export const createJob = async (input) => {
    const mutation = gql`
        mutation CreateJob($input: CreateJobInput!) {
            job: createJob(input: $input) {
                id
                description
                title
                company {
                    id
                    name
                }
            }
        }`;

    const {data: {job}} = await client.mutate({mutation, variables: {input}});
    return job;

}

export const loadCompany = async (companyId) => {
    const query = gql
            `query CompanyQuery($companyId: ID!) {
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
    const {data: {company}} = await client.query({query, variables: {companyId}});
    return company;
}

export const loadJob = async (jobId) => {
    const query = gql`
        query JobQuery($jobId: ID!) {
            job(id: $jobId) {
                id
                title
                company {
                    id
                    name
                }
                description
            }
        }
    `;

    const {data: {job}} = await client.query({query, variables: {jobId}});
    return job;
}

export const loadJobs = async (limit) => {
    const query = gql`
        query ($limit: Int!) {
            jobs(limit: $limit) {
                id
                title
                company {
                    id
                    name
                }
            }
        }`;
    const {data: {jobs}} = await client.query({query, variables: {limit}});
    return jobs;
}
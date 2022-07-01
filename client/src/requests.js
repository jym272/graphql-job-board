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

    }
);

const jobDetailFragment = gql`
    fragment JobDetailFragment on Job {
        id
        description
        title
        company {
            name
            id
        }
    }
`;

const companyQuery = gql
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
const createJobMutation = gql`
    mutation CreateJob($input: CreateJobInput!) {
        job: createJob(input: $input) {
            ...JobDetailFragment
        }
    }
    ${jobDetailFragment}
`;
const jobsQuery = gql`
    query JobsQuery($limit: Int!) {
        jobs(limit: $limit) {
            id
            title
            company {
                id
                name
            }
        }
    }`;
const jobQuery = gql`
    query JobQuery($jobId: ID!) {
        job(id: $jobId) {
            ...JobDetailFragment
        }
    }
    ${jobDetailFragment}
`;

export const createJob = async (input) => {
    const {data: {job}} = await client.mutate(
        {
            mutation: createJobMutation,
            variables: {input},
            update: (cache, {data: {job}}) => {
                cache.writeQuery(
                    {
                        query: jobQuery,
                        variables: {jobId: job.id},
                        data: {job}
                    }
                );
            }
        });
    return job;

}

export const loadCompany = async (companyId) => {
    const {data: {company}} = await client.query({query: companyQuery, variables: {companyId}});
    return company;
}

export const loadJob = async (jobId) => {
    const {data: {job}} = await client.query({query: jobQuery, variables: {jobId}});
    return job;
}

export const loadJobs = async (limit) => {
    const {data: {jobs}} = await client.query(
        {
            query: jobsQuery,
            variables: {limit},
            fetchPolicy: "no-cache"
        });
    return jobs;
}
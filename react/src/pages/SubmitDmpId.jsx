import axios from 'axios';
import { useEffect, useState } from 'react';
import { Container, Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Atom } from 'react-loading-indicators';
import Markdown from 'react-markdown';

import { ASUHeader } from "@asu/component-header";
import { ASUFooter } from "@asu/component-footer";

import 'github-markdown-css/github-markdown-light.css';
import asuLogo from '../assets/arizona-state-university-logo-vertical.png';

export function SubmitDmpId() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState,
  } = useForm();

  const { mutate } = useMutation({
    mutationFn: (values) => {
      setIsLoading(true);
      axios
        .post(import.meta.env.VITE_BACKEND_URL + '/dmp', {
          dmpId: values.dmpId,
        })
        .then(function (response) {
          setApiResponse({
            statusCode: 200,
            statusMessage: null,
            ...response.data.data,
          });
          setIsLoading(false);
        })
        .catch((error) => {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log('response data:', error.response.data);
            console.log('response status:', error.response.status);
            console.log('response headers:', error.response.headers);

            setApiResponse({
              statusCode: error.response.status,
              statusMessage: error.response.data.error.message,
              analysis: null,
              metadata: null,
            });
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the
            // browser and an instance of
            // http.ClientRequest in node.js
            console.log('request:', error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error:', error.message);
          }
          console.log('error config:', error.config);
          setIsLoading(false);
        });
    },
  });

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset();
    }
  }, [formState, reset]);

  const header = {
    title: 'DMSP AI Assistant',
    loggedIn: false,
    logoutLink: "#",
    loginLink: "#",
    userName: "",
    // navTree: navTree,
    logo: {
      alt: 'Arizona State University',
      title: "Arizona State University",
      src: asuLogo,
      // mobileSrc: asuLogo,
      // brandLink: PropTypes.string,
    },
    parentOrg: "KE Research Technology Office",
    parentOrgUrl: "https://rto.asu.edu",
    breakpoint: "Lg",
    searchUrl: "https://search.asu.edu/search",
    site: "subdomain",
  }

  const footer = {

  }


  return (
    <>
    <ASUHeader {...header} />
    <Container className="mt-16" style={{"minHeight": "400px"}}>
      <Row>
        <Col md={12}>
          <h1 className="mt-4">DMSP AI Assistant: Proof-of-Concept</h1>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={8}>
          <div>This form demonstrates a simple implementation of the DMSP AI Assistant backend service. When a valid DMP ID is submitted, the service will fetch that plan, extract its content, and query the AI Assistant to review the plan.</div>
          <div>Feel free to copy and paste one of the following DMP IDs as examples:</div>
          <ul>
            <li>10.48321/D1R316 <a href="https://dmphub.uc3prd.cdlib.net/narratives/8736430c42e1256e.pdf" target="_blank" rel="noopener noreferrer">View plan PDF</a></li>
            <li>10.48321/D1BK5T <a href="https://dmphub.uc3prd.cdlib.net/narratives/a5ae186a7925051c.pdf" target="_blank" rel="noopener noreferrer">View plan PDF</a></li>
          </ul>
          <form
            onSubmit={handleSubmit((values) =>
              // reset client state back to undefined
              mutate(values, { onSuccess: () => reset() })
            )}
          >
            <div>
              <label>Please submit a valid DMP ID:</label>
            </div>
            <input {...register('dmpId')} />
            <input type="submit" />
          </form>
        </Col>
      </Row>
      {isLoading && (
        <Row className="mt-2">
          <Col md={12}>
            <div className="border p-2">
              <div className="d-flex justify-content-center">
                <Row>
                  <h3>Thank you for your patience...</h3>
                </Row>
              </div>
              <div className="d-flex justify-content-center">
                <Row>
                  <Atom color="#000000" size="medium" text="" textColor="" />
                </Row>
              </div>
            </div>
          </Col>
        </Row>
      )}
      {!isLoading && apiResponse && apiResponse.statusCode === 200 && (
        <Row className="mt-2 mb-4">
          <Col md={12}>
            <div className="border p-2 markdown-body">
              <Markdown>{apiResponse?.analysis}</Markdown>
            </div>
          </Col>
        </Row>
      )}
      {!isLoading && apiResponse && apiResponse?.statusCode !== 200 && (
        <Row className="mt-2">
          <Col md={12}>
            <div className="border p-2">
              <h2>Error</h2>
              <p>{apiResponse?.statusMessage}</p>
            </div>
          </Col>
        </Row>
      )}
    </Container>
    <ASUFooter {...footer} />
    </>
  );
}

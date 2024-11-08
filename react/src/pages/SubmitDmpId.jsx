import axios from 'axios';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Atom } from 'react-loading-indicators';
import Markdown from 'react-markdown';

import 'github-markdown-css/github-markdown-light.css';

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


  return (
    <>
      <Row className="mb-4">
        <Col md={8}>
          <div className="mt-2">This form demonstrates a simple implementation of the DMSP AI Assistant backend service. When a valid DMP ID is submitted, the service will fetch that plan, extract its content, and query the AI Assistant to review the plan.</div>
          <div className="mt-2">Feel free to copy and paste one of the following DMP IDs as examples:</div>
          <ul className="mt-2">
            <li>10.48321/D1R316 (<a href="https://dmphub.uc3prd.cdlib.net/dmps/10.48321/D1R316" target="_blank" rel="noopener noreferrer">View DMP</a>)</li>
            <li>10.48321/D1BK5T (<a href="https://dmphub.uc3prd.cdlib.net/dmps/10.48321/D1BK5T" target="_blank" rel="noopener noreferrer">View DMP</a>)</li>
          </ul>
          <form
            onSubmit={handleSubmit((values) =>
              // reset client state back to undefined
              mutate(values, { onSuccess: () => reset() })
            )}
          >
            <div>
              <label>Please submit DMP ID:</label>
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
    </>
  );
}

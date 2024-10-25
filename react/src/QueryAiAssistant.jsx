import axios from 'axios';
import { useEffect, useState } from 'react';
import { Accordion, Container, Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Atom } from 'react-loading-indicators';
import Markdown from 'react-markdown';

import 'github-markdown-css/github-markdown-light.css';

export function QueryAiAssistant() {
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
        .post(process.env.API_BACKEND_URL + '/dmp', {
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
    <Container>
      <Row>
        <Col md={12}>
          <h1>DMP AI Assistant</h1>
          <h3>Proof-of-concept: Please do not share.</h3>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={8}>
          <form
            onSubmit={handleSubmit((values) =>
              // reset client state back to undefined
              mutate(values, { onSuccess: () => reset() })
            )}
          >
            <div>
              <label>DMP ID:</label>
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
        <Row className="mt-2">
          <Col md={12}>
            <div className="border p-2 markdown-body">
              <Accordion defaultActiveKey="0">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Analysis for: {apiResponse?.id}</Accordion.Header>
                  <Accordion.Body>
                    <Markdown>{apiResponse?.analysis}</Markdown>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header>DMP Text</Accordion.Header>
                  <Accordion.Body>
                    <p>{apiResponse?.documentText}</p>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
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
  );
}

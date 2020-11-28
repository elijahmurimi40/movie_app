import axios from 'axios';
import React, { MouseEvent, useRef, useState, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Divider, Form, Header, Message } from 'semantic-ui-react';
import './App.css';

const submitButtonNormal = ['blue', 'submit'];
const submitButtonLoading = ['teal', 'loading'];
const hideClass = ['hide'];

let formRef: MutableRefObject<HTMLFormElement|null>;
let submitButton: MutableRefObject<HTMLAnchorElement|null>;
let errorMessage: MutableRefObject<HTMLDivElement|null>;
let successMessage: MutableRefObject<HTMLDivElement|null>;

let [isRequesting, setIsRequesting]: [boolean|null, Dispatch<SetStateAction<boolean>>|null] = [null, null];

function App() {
  formRef = useRef<HTMLFormElement>(null);
  submitButton = useRef<HTMLAnchorElement>(null);
  errorMessage = useRef<HTMLDivElement>(null);
  successMessage = useRef<HTMLDivElement>(null);

  [isRequesting, setIsRequesting] = useState(Boolean);

  return (
    <Container style={{marginTop: '10px'}}>
      <Row>
        <Col />

        <Col lg={6} md={8} sm={10} xl={6} xs={12}>
          <Divider horizontal>
            <Header as='h3' color='green'>Movie App</Header>
          </Divider>

          <div>
            <Message attached header='Update Movie App Info' />
            <form className='ui form attached fluid segment' ref={formRef}>
              <Form.Input label='Version Code' placeholder='Verion Code' type='text' name='version_code' />
              <Form.Input label='Version Name' placeholder='Version Name' type='text' name='version_name'/>
              <Form.Input label='Password' placeholder='Password' type='password' name='password' />
              <div className='field'>
                <div className='ui negative message hide' ref={errorMessage}>All Fields Are Required</div>
                <div className='ui positive message hide' ref={successMessage}>Successfully Updated</div>
                </div>
              <a href='update' 
                className='ui fluid blue submit button' 
                onClick={updateData} ref={submitButton}
              >
                Update
              </a>
            </form>
          </div>
        </Col>

        <Col />
      </Row>
    </Container>
  );
}

const updateData = (e: MouseEvent) => {
  e.preventDefault();
  if (isRequesting)
    return;
    
  removeAddClassess(errorMessage.current!!, [], hideClass);
  removeAddClassess(successMessage.current!!, [], hideClass);
  removeAddClassess(submitButton.current!!, submitButtonNormal, submitButtonLoading);
  setIsRequesting!!(true);

  formSerialize(formRef.current!!);
}

const formSerialize = (formElement: HTMLFormElement) => {
  const values: { [key: string]: string|number } = {};
  const inputs: HTMLFormControlsCollection = formElement.elements;

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i] as HTMLInputElement;
    if(input.value.trim() === ''){
      showError('All Fields Are Required');
      break;
    }

    values[input.name] = input.value;
  }

  if(Object.getOwnPropertyNames(values).length !== inputs.length)
    return;
  
  const dataValues: { [key: string]: string|number } = {}
  dataValues['version_code'] = values['version_code'];
  dataValues['version_name'] = values['version_name'];

  const finalValues: { [key: string]: string|number|object } = {};
  finalValues['password'] = values['password'];
  finalValues['data'] = dataValues;

  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  axios.post('https://movieappversioncodeandnamephp.herokuapp.com/insert', finalValues, axiosConfig)
    .then(res => {
      const status = res.data.error;

      if(status !== undefined && status.status !== 200) {
        showError(res.data.error.message);
      } else {
        showSuccess();
      }
    })
    .catch(err => {
      /**
       * if(err.response) {
       * // client received an error response (5xx, 4xx)
       * } else if(err.request) {
       * // client never received a response, or request never left
       * } else {
       * // anything else
       * } 
       */
    showError('Error connecting to server try again.');
    });
}

const removeAddClassess = (
  formElement: HTMLElement, removeCollection: Array<string>, addCollection: Array<string>
  ) => {

  removeCollection.forEach(element => {
    formElement.classList.remove(element);
  });

  addCollection.forEach(element => {
    formElement.classList.add(element);
  });

}

const showError = (errorMsg: string) => {
  errorMessage.current!!.innerText = errorMsg;
  removeAddClassess(errorMessage.current!!, hideClass, []);
  removeAddClassess(successMessage.current!!, [], hideClass);
  removeAddClassess(submitButton.current!!, submitButtonLoading, submitButtonNormal);
  setIsRequesting!!(false);
}

const showSuccess = () => {
  removeAddClassess(errorMessage.current!!, [], hideClass);
  removeAddClassess(successMessage.current!!, hideClass, []);
  removeAddClassess(submitButton.current!!, submitButtonLoading, submitButtonNormal);
  setIsRequesting!!(false);
}

export default App;

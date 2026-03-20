package com.example.productservice.exception;



import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.Date;
import java.util.List;

@RestControllerAdvice
public class GlobalHandleException {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handlerFLearningException(AppException exception, WebRequest request) {
        ErrorResponse response = ErrorResponse.builder()
                .code(exception.getErrorCode().getCode())
                .error(exception.getErrorCode().getStatus().getReasonPhrase())
                .message(exception.getMessage())
                .timestamp(new Date())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return ResponseEntity.status(exception.getErrorCode().getStatus()).body(response);
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handlerMethodArgumentNotValidException(MethodArgumentNotValidException e, WebRequest request) {

        BindingResult bindingResult = e.getBindingResult();

        List<FieldError> fieldErrors = bindingResult.getFieldErrors();

        List<String> errors = fieldErrors.stream().map(FieldError::getDefaultMessage).toList();

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(new Date())
                .code(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(errors.size() > 1 ? String.valueOf(errors) : errors.get(0))
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }


//    private ErrorResponse buildErrorCodeResponse(ErrorCode errorCode ,WebRequest request) {
//        return ErrorResponse.builder()
//                .timestamp(new Date())
//                .code(errorCode.getCode())
//                .message(errorCode.getMessage())
//                .error(errorCode.getStatus().getReasonPhrase())
//                .path(request.getDescription(false).replace("uri=", ""))
//                .build();
//    }
}

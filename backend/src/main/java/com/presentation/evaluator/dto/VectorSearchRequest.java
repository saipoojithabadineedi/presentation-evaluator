package com.presentation.evaluator.dto;

import lombok.Data;

@Data
public class VectorSearchRequest {
    private String queryText;
    private int limit = 5;
}

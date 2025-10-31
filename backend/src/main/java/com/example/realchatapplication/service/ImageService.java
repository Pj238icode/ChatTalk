package com.example.realchatapplication.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;

@Service
public class ImageService {


    @Value("${aws.s3.bucket}")
    private String bucketName;


    @Value("${aws.region}")
    private String region;

    private final S3Client s3Client;


    public ImageService(S3Client s3Client){
        this.s3Client=s3Client;
    }

    public String uploadFile(MultipartFile file) {
        try {
            String key = "uploads/" + System.currentTimeMillis() + "_" + file.getOriginalFilename();

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .acl(ObjectCannedACL.PUBLIC_READ)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));


            return s3Client.utilities().getUrl(builder -> builder.bucket(bucketName).key(key)).toExternalForm();

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to S3", e);
        }
    }


}


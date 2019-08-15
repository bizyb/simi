package com.elifsis.SimiSpring.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.concurrent.atomic.AtomicLong

@RestController
@RequestMapping("user")
class UserController {

    @GetMapping("/count") //TODO: user must be logged in to access this endpoint
    fun count(): String {
        return "17"
    }

}
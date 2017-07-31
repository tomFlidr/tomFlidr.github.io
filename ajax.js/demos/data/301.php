<?php

	header("HTTP/1.0 301 See Other");
	header("Location: " . str_replace('301.php', 'xml.php', $_SERVER['REQUEST_URI']));
	die();
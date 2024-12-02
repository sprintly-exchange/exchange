import { ConnectionFS } from "../../api/models/ConnectionFS.mjs";
import { ConnectionHTTP } from "../../api/models/ConnectionHTTP.mjs";
import { Flow } from "../../api/models/Flow.mjs";
import {v4 as uuidv4} from 'uuid';
import GlobalConfiguration from "../../GlobalConfiguration.mjs";

//variables used to run the demo mode
let Pickup_Weather_Data:any=undefined;
let Pickup_Orders:any=undefined;
let Pickup_OrderResponses:any=undefined;
let Pickup_Invoices:any=undefined;

let Pickup_PetstoreInvetory:any =undefined;
let Delivery_RecycleBin:any=undefined;
let Delivery_PetstoreInventory:any=undefined;
let Deliver_OrderResponses:any=undefined;
let Deliver_Invoices:any=undefined;
let Deliver_Orders:any=undefined;

let flow_pet_store_inventory:any =undefined;
let flow_weather_data:any=undefined;
let flow_process_order_respones:any=undefined;
let flow_process_orders:any=undefined;
let flow_process_invoices:any=undefined;

let demoPickups:any = undefined;
let demoDeliveries:any = undefined;
let demoFlows:any = undefined;

let Processing_code_default:any = undefined;
let Invoice_JSON_to_XML_Mapper_Example_Code:any = undefined;

export function addDemoCases(organizationId:string){

  Processing_code_default = {
    "id": uuidv4(),
    "code":"ewogIG1ldGhvZDogYXN5bmMgZnVuY3Rpb24gKHRyYW5zYWN0aW9uUHJvY2Vzc01hbmFnZXIpIHsKICAgIGNvbnNvbGUubG9nKCJIYW5kbGluZyB0aGUgRURJRkFDVCwgWE1MLCBvciBKU09OIG1lc3NhZ2UgY29udGVudC4uLiEiKTsKICAgIGxldCB0cmFuc2FjdGlvbkRhdGE7CiAgICBjb25zdCBjdXJyZW50TWVzc2FnZSA9IHRyYW5zYWN0aW9uUHJvY2Vzc01hbmFnZXIudHJhbnNhY3Rpb24uY3VycmVudE1lc3NhZ2U7CgogICAgLy8gQ2hlY2sgaWYgdGhlIG1lc3NhZ2UgY29udGFpbnMgJ1VOSCcgdG8gZGV0ZXJtaW5lIGlmIGl0J3MgRURJRkFDVAogICAgaWYgKGN1cnJlbnRNZXNzYWdlLmluY2x1ZGVzKCJVTkgiKSkgewogICAgICBjb25zb2xlLmxvZygiRGV0ZWN0ZWQgRURJRkFDVCBmb3JtYXQiKTsKICAgICAgdHJhbnNhY3Rpb25Qcm9jZXNzTWFuYWdlci50cmFuc2FjdGlvbi5tZXNzYWdlVHlwZSA9ICdFRElGQUNUJzsKCiAgICAgIHRyeSB7CiAgICAgICAgLy8gTm9ybWFsaXplIG1lc3NhZ2UgYnkgcmVtb3ZpbmcgbmV3bGluZSBjaGFyYWN0ZXJzIGFuZCBzcGxpdHRpbmcgYnkgc2VnbWVudCB0ZXJtaW5hdG9yICInIgogICAgICAgIGNvbnN0IGNsZWFuZWRNZXNzYWdlID0gY3VycmVudE1lc3NhZ2UucmVwbGFjZSgvXG4vZywgIiIpOwogICAgICAgIGNvbnN0IHNlZ21lbnRzID0gY2xlYW5lZE1lc3NhZ2Uuc3BsaXQoIiciKTsKCiAgICAgICAgLy8gSW5pdGlhbGl6ZSB2YXJpYWJsZXMgZm9yIG1lc3NhZ2VJZCwgc2VuZGVySWQsIGFuZCByZWNlaXZlcklkCiAgICAgICAgbGV0IG1lc3NhZ2VJZCwgc2VuZGVySWQsIHJlY2VpdmVySWQ7CgogICAgICAgIC8vIExvb3AgdGhyb3VnaCBlYWNoIHNlZ21lbnQgYW5kIGZpbmQgcmVsZXZhbnQgZGF0YQogICAgICAgIHNlZ21lbnRzLmZvckVhY2goc2VnbWVudCA9PiB7CiAgICAgICAgICBjb25zdCBwYXJ0cyA9IHNlZ21lbnQuc3BsaXQoIisiKTsKCiAgICAgICAgICAvLyBFeHRyYWN0IG1lc3NhZ2VJZCBmcm9tIFVOSCBzZWdtZW50CiAgICAgICAgICBpZiAocGFydHNbMF0gPT09ICJVTkgiKSB7CiAgICAgICAgICAgIG1lc3NhZ2VJZCA9IHBhcnRzWzFdOyAgLy8gbWVzc2FnZUlkIGlzIHRoZSBzZWNvbmQgZWxlbWVudCBpbiBVTkgKICAgICAgICAgIH0KCiAgICAgICAgICAvLyBFeHRyYWN0IHNlbmRlcklkIGZyb20gTkFEK0JZIHNlZ21lbnQgKEJ1eWVyKQogICAgICAgICAgaWYgKHBhcnRzWzBdID09PSAiTkFEIiAmJiBwYXJ0c1sxXSA9PT0gIkJZIikgewogICAgICAgICAgICBzZW5kZXJJZCA9IHBhcnRzWzJdLnNwbGl0KCI6IilbMF07IC8vIEV4dHJhY3Qgb25seSB0aGUgcGFydCBiZWZvcmUgIjoiCiAgICAgICAgICB9CgogICAgICAgICAgLy8gRXh0cmFjdCByZWNlaXZlcklkIGZyb20gTkFEK1NFIHNlZ21lbnQgKFNlbGxlcikKICAgICAgICAgIGlmIChwYXJ0c1swXSA9PT0gIk5BRCIgJiYgcGFydHNbMV0gPT09ICJTRSIpIHsKICAgICAgICAgICAgcmVjZWl2ZXJJZCA9IHBhcnRzWzJdLnNwbGl0KCI6IilbMF07IC8vIEV4dHJhY3Qgb25seSB0aGUgcGFydCBiZWZvcmUgIjoiCiAgICAgICAgICB9CiAgICAgICAgfSk7CgogICAgICAgIC8vIFZhbGlkYXRlIGV4dHJhY3RlZCBkYXRhCiAgICAgICAgaWYgKG1lc3NhZ2VJZCAmJiBzZW5kZXJJZCAmJiByZWNlaXZlcklkKSB7CiAgICAgICAgICB0cmFuc2FjdGlvblByb2Nlc3NNYW5hZ2VyLnRyYW5zYWN0aW9uLm1lc3NhZ2VJZCA9IG1lc3NhZ2VJZDsKICAgICAgICAgIHRyYW5zYWN0aW9uUHJvY2Vzc01hbmFnZXIudHJhbnNhY3Rpb24uc2VuZGVySWQgPSBzZW5kZXJJZDsKICAgICAgICAgIHRyYW5zYWN0aW9uUHJvY2Vzc01hbmFnZXIudHJhbnNhY3Rpb24ucmVjZWl2ZXJJZCA9IHJlY2VpdmVySWQ7CiAgICAgICAgICAKICAgICAgICAgIGNvbnNvbGUubG9nKCJFeHRyYWN0ZWQgSURzOiAiLCB7IG1lc3NhZ2VJZCwgc2VuZGVySWQsIHJlY2VpdmVySWQgfSk7CiAgICAgICAgICByZXR1cm4gdHJ1ZTsKICAgICAgICB9IGVsc2UgewogICAgICAgICAgY29uc29sZS5lcnJvcigiUmVxdWlyZWQgSURzIG5vdCBmb3VuZCBpbiBFRElGQUNUIG1lc3NhZ2UiKTsKICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gUmV0dXJuIGZhbHNlIGlmIElEcyBhcmUgbm90IHByZXNlbnQKICAgICAgICB9CiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7CiAgICAgICAgY29uc29sZS5lcnJvcigiRmFpbGVkIHRvIHByb2Nlc3MgRURJRkFDVCBtZXNzYWdlOiIsIGVycm9yKTsKICAgICAgICByZXR1cm4gZmFsc2U7IC8vIFJldHVybiBmYWxzZSBpZiBwYXJzaW5nIGZhaWxzCiAgICAgIH0KCiAgICB9IAogICAgLy8gQ2hlY2sgaWYgdGhlIG1lc3NhZ2UgaXMgWE1MIHVzaW5nIHhtbDJqcwogICAgZWxzZSBpZiAoYXdhaXQgaXNYbWxTdHJpbmcoY3VycmVudE1lc3NhZ2UpKSB7CiAgICAgIGNvbnNvbGUubG9nKCJEZXRlY3RlZCBYTUwgZm9ybWF0Iik7CiAgICAgIHRyYW5zYWN0aW9uUHJvY2Vzc01hbmFnZXIudHJhbnNhY3Rpb24ubWVzc2FnZVR5cGUgPSAnWE1MJzsKICAgICAgdHJ5IHsKICAgICAgICBjb25zdCBwYXJzZWRYbWwgPSBhd2FpdCBwYXJzZVhtbChjdXJyZW50TWVzc2FnZSk7CgogICAgICAgIGNvbnN0IG1lc3NhZ2VJZCA9IHBhcnNlZFhtbD8ubWVzc2FnZT8ubWVzc2FnZUlkPy5bMF07CiAgICAgICAgY29uc3Qgc2VuZGVySWQgPSBwYXJzZWRYbWw/Lm1lc3NhZ2U/LnNlbmRlcklkPy5bMF07CiAgICAgICAgY29uc3QgcmVjZWl2ZXJJZCA9IHBhcnNlZFhtbD8ubWVzc2FnZT8ucmVjZWl2ZXJJZD8uWzBdOwoKICAgICAgICAvLyBWYWxpZGF0ZSBleHRyYWN0ZWQgZGF0YQogICAgICAgIGlmIChtZXNzYWdlSWQgJiYgc2VuZGVySWQgJiYgcmVjZWl2ZXJJZCkgewogICAgICAgICAgdHJhbnNhY3Rpb25Qcm9jZXNzTWFuYWdlci50cmFuc2FjdGlvbi5tZXNzYWdlSWQgPSBtZXNzYWdlSWQ7CiAgICAgICAgICB0cmFuc2FjdGlvblByb2Nlc3NNYW5hZ2VyLnRyYW5zYWN0aW9uLnNlbmRlcklkID0gc2VuZGVySWQ7CiAgICAgICAgICB0cmFuc2FjdGlvblByb2Nlc3NNYW5hZ2VyLnRyYW5zYWN0aW9uLnJlY2VpdmVySWQgPSByZWNlaXZlcklkOwogICAgICAgICAgCiAgICAgICAgICBjb25zb2xlLmxvZygiRXh0cmFjdGVkIElEcyBmcm9tIFhNTDogIiwgeyBtZXNzYWdlSWQsIHNlbmRlcklkLCByZWNlaXZlcklkIH0pOwogICAgICAgICAgcmV0dXJuIHRydWU7CiAgICAgICAgfSBlbHNlIHsKICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIlJlcXVpcmVkIElEcyBub3QgZm91bmQgaW4gWE1MIG1lc3NhZ2UiKTsKICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gUmV0dXJuIGZhbHNlIGlmIElEcyBhcmUgbm90IHByZXNlbnQKICAgICAgICB9CiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7CiAgICAgICAgY29uc29sZS5lcnJvcigiRmFpbGVkIHRvIHByb2Nlc3MgWE1MIG1lc3NhZ2U6IiwgZXJyb3IpOwogICAgICAgIHJldHVybiBmYWxzZTsgLy8gUmV0dXJuIGZhbHNlIGlmIHBhcnNpbmcgZmFpbHMKICAgICAgfQogICAgfSAKICAgIC8vIENoZWNrIGlmIHRoZSBtZXNzYWdlIGlzIEpTT04KICAgIGVsc2UgewogICAgICBjb25zb2xlLmxvZygiRGV0ZWN0ZWQgSlNPTiBmb3JtYXQiKTsKCiAgICAgIHRyeSB7CiAgICAgICAgdHJhbnNhY3Rpb25EYXRhID0gSlNPTi5wYXJzZShjdXJyZW50TWVzc2FnZSk7CiAgICAgICAgdHJhbnNhY3Rpb25Qcm9jZXNzTWFuYWdlci50cmFuc2FjdGlvbi5tZXNzYWdlVHlwZSA9ICdKU09OJzsKICAgICAgICAvLyBDaGVjayBpZiB0aGUgSlNPTiBvYmplY3QgaGFzIHRoZSByZXF1aXJlZCBwcm9wZXJ0aWVzCiAgICAgICAgaWYgKHRyYW5zYWN0aW9uRGF0YS5tZXNzYWdlSWQgJiYgdHJhbnNhY3Rpb25EYXRhLnNlbmRlcklkICYmIHRyYW5zYWN0aW9uRGF0YS5yZWNlaXZlcklkKSB7CiAgICAgICAgICB0cmFuc2FjdGlvblByb2Nlc3NNYW5hZ2VyLnRyYW5zYWN0aW9uLm1lc3NhZ2VJZCA9IHRyYW5zYWN0aW9uRGF0YS5tZXNzYWdlSWQ7CiAgICAgICAgICB0cmFuc2FjdGlvblByb2Nlc3NNYW5hZ2VyLnRyYW5zYWN0aW9uLnNlbmRlcklkID0gdHJhbnNhY3Rpb25EYXRhLnNlbmRlcklkOwogICAgICAgICAgdHJhbnNhY3Rpb25Qcm9jZXNzTWFuYWdlci50cmFuc2FjdGlvbi5yZWNlaXZlcklkID0gdHJhbnNhY3Rpb25EYXRhLnJlY2VpdmVySWQ7CiAgICAgICAgICAKICAgICAgICAgIGNvbnNvbGUubG9nKCJFeHRyYWN0ZWQgSURzIGZyb20gSlNPTjogIiwgdHJhbnNhY3Rpb25EYXRhKTsKICAgICAgICAgIHJldHVybiB0cnVlOwogICAgICAgIH0gZWxzZSB7CiAgICAgICAgICBjb25zb2xlLmVycm9yKCJSZXF1aXJlZCBJRHMgbm90IGZvdW5kIGluIHRoZSBKU09OIG9iamVjdCIpOwogICAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBSZXR1cm4gZmFsc2UgaWYgSURzIGFyZSBub3QgcHJlc2VudCBpbiB0aGUgSlNPTgogICAgICAgIH0KICAgICAgfSBjYXRjaCAoZXJyb3IpIHsKICAgICAgICBjb25zb2xlLmVycm9yKCJGYWlsZWQgdG8gcGFyc2UgY3VycmVudE1lc3NhZ2UgdG8gSlNPTjoiLCBlcnJvcik7CiAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBSZXR1cm4gZmFsc2UgaWYgcGFyc2luZyBmYWlscwogICAgICB9CiAgICB9CiAgfQp9CgovLyBVdGlsaXR5IGZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBtZXNzYWdlIGlzIHZhbGlkIFhNTCB1c2luZyB4bWwyanMKYXN5bmMgZnVuY3Rpb24gaXNYbWxTdHJpbmcoc3RyKSB7CiAgdHJ5IHsKICAgIGF3YWl0IHBhcnNlWG1sKHN0cik7CiAgICByZXR1cm4gdHJ1ZTsKICB9IGNhdGNoIChlcnJvcikgewogICAgcmV0dXJuIGZhbHNlOwogIH0KfQoKLy8gVXRpbGl0eSBmdW5jdGlvbiB0byBwYXJzZSBYTUwgdXNpbmcgeG1sMmpzCmZ1bmN0aW9uIHBhcnNlWG1sKHN0cikgewogIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7CiAgICB4bWwyanMucGFyc2VTdHJpbmcoc3RyLCAoZXJyLCByZXN1bHQpID0+IHsKICAgICAgaWYgKGVycikgewogICAgICAgIHJlamVjdChlcnIpOwogICAgICB9IGVsc2UgewogICAgICAgIHJlc29sdmUocmVzdWx0KTsKICAgICAgfQogICAgfSk7CiAgfSk7Cn0K",
    "processingName":"Default",
    "organizationId":organizationId,
  }

  Invoice_JSON_to_XML_Mapper_Example_Code = {
    "id": uuidv4(),
    "code":"ewogIG1ldGhvZDogYXN5bmMgZnVuY3Rpb24gKHRyYW5zYWN0aW9uUHJvY2Vzc01hbmFnZXIpIHsKICAgIGNvbnNvbGUubG9nKCJQcm9jZXNzaW5nIHRoZSBtZXNzYWdlLi4uIik7CgogICAgY29uc3QgY3VycmVudE1lc3NhZ2UgPSB0cmFuc2FjdGlvblByb2Nlc3NNYW5hZ2VyLnRyYW5zYWN0aW9uLmN1cnJlbnRNZXNzYWdlOwogICAgbGV0IHRyYW5zYWN0aW9uRGF0YTsKCiAgICB0cnkgewogICAgICAvLyBDaGVjayBpZiB0aGUgbWVzc2FnZSBpcyBpbiBFRElGQUNUIGZvcm1hdCBieSBsb29raW5nIGZvciAnVU5IJwogICAgICBpZiAoY3VycmVudE1lc3NhZ2UuaW5jbHVkZXMoIlVOSCIpKSB7CiAgICAgICAgY29uc29sZS5sb2coIkRldGVjdGVkIEVESUZBQ1QgZm9ybWF0Iik7CiAgICAgICAgdHJhbnNhY3Rpb25Qcm9jZXNzTWFuYWdlci50cmFuc2FjdGlvbi5pbnB1dE1lc3NhZ2VUeXBlID0gJ0VESUZBQ1QnOwogICAgICAgIHRyYW5zYWN0aW9uUHJvY2Vzc01hbmFnZXIudHJhbnNhY3Rpb24ub3V0cHV0TWVzc2FnZVR5cGUgPSAnRURJRkFDVCc7CiAgICAgICAgdHJhbnNhY3Rpb25Qcm9jZXNzTWFuYWdlci50cmFuc2FjdGlvbi5tZXNzYWdlVHlwZSA9IHRyYW5zYWN0aW9uUHJvY2Vzc01hbmFnZXIudHJhbnNhY3Rpb24uaW5wdXRNZXNzYWdlVHlwZSArICctPicgKyB0cmFuc2FjdGlvblByb2Nlc3NNYW5hZ2VyLnRyYW5zYWN0aW9uLm91dHB1dE1lc3NhZ2VUeXBlOwogICAgICAgIHJldHVybiB0cnVlOwoKICAgICAgfSBlbHNlIHsKICAgICAgICAvLyBIYW5kbGUgSlNPTiBmb3JtYXQKICAgICAgICBjb25zb2xlLmxvZygiRGV0ZWN0ZWQgSlNPTiBmb3JtYXQiKTsKCiAgICAgICAgLy8gUGFyc2UgdGhlIGN1cnJlbnRNZXNzYWdlIGFzIEpTT04KICAgICAgICB0cmFuc2FjdGlvbkRhdGEgPSBKU09OLnBhcnNlKGN1cnJlbnRNZXNzYWdlKTsKICAgICAgICB0cmFuc2FjdGlvbkRhdGEgPyB0cmFuc2FjdGlvblByb2Nlc3NNYW5hZ2VyLnRyYW5zYWN0aW9uLmlucHV0TWVzc2FnZVR5cGUgPSAnSlNPTic6Jyc7CgogICAgICAgIC8vIFZhbGlkYXRlIHRoYXQgaXQncyBhIHZhbGlkIEpTT04gaW52b2ljZSB3aXRoIHJlcXVpcmVkIGZpZWxkcwogICAgICAgIGlmICghdHJhbnNhY3Rpb25EYXRhLmludm9pY2VfaWQgfHwgIXRyYW5zYWN0aW9uRGF0YS5vcmRlcl9pZCB8fCAhdHJhbnNhY3Rpb25EYXRhLml0ZW1zKSB7CiAgICAgICAgICAKICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIlJlcXVpcmVkIGZpZWxkcyBub3QgZm91bmQgaW4gdGhlIEpTT04gaW52b2ljZSIpOwogICAgICAgICAgcmV0dXJuIGZhbHNlOwogICAgICAgIH0KICAgICAgfQoKICAgICAgLy8gUHJvY2VzcyB0aGUgdHJhbnNhY3Rpb25EYXRhIHRvIGdlbmVyYXRlIGFuIFhNTCBpbnZvaWNlCiAgICAgIC8vIER5bmFtaWNhbGx5IGltcG9ydCBuZWNlc3NhcnkgWE1MIG1vZHVsZXMKICAgICAgY29uc3QgeyBET01QYXJzZXIsIFhNTFNlcmlhbGl6ZXIgfSA9IGF3YWl0IGltcG9ydCgneG1sZG9tJyk7ICAvLyBVc2UgJ3htbGRvbScgb3IgYW5vdGhlciBsaWJyYXJ5CgogICAgICAvLyBDcmVhdGUgYW4gWE1MIGRvY3VtZW50IHVzaW5nIHhtbGRvbQogICAgICBjb25zdCBkb21JbXBsZW1lbnRhdGlvbiA9IG5ldyBET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcoIjxyb290Pjwvcm9vdD4iLCAiYXBwbGljYXRpb24veG1sIik7CiAgICAgIGNvbnN0IHhtbERvYyA9IGRvbUltcGxlbWVudGF0aW9uLmltcGxlbWVudGF0aW9uLmNyZWF0ZURvY3VtZW50KCIiLCAiaW52b2ljZSIsIG51bGwpOwogICAgICBjb25zdCBpbnZvaWNlRWxlbWVudCA9IHhtbERvYy5kb2N1bWVudEVsZW1lbnQ7CgogICAgICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gYXBwZW5kIFhNTCBlbGVtZW50cwogICAgICBjb25zdCBhcHBlbmRDaGlsZEVsZW1lbnQgPSAocGFyZW50LCB0YWdOYW1lLCB0ZXh0Q29udGVudCkgPT4gewogICAgICAgIGNvbnN0IGVsZW1lbnQgPSB4bWxEb2MuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTsKICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gdGV4dENvbnRlbnQ7CiAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpOwogICAgICB9OwoKICAgICAgLy8gQWRkIGJhc2ljIGZpZWxkcyB0byBYTUwKICAgICAgYXBwZW5kQ2hpbGRFbGVtZW50KGludm9pY2VFbGVtZW50LCAiaW52b2ljZV9pZCIsIHRyYW5zYWN0aW9uRGF0YS5pbnZvaWNlX2lkKTsKICAgICAgYXBwZW5kQ2hpbGRFbGVtZW50KGludm9pY2VFbGVtZW50LCAib3JkZXJfaWQiLCB0cmFuc2FjdGlvbkRhdGEub3JkZXJfaWQpOwogICAgICBhcHBlbmRDaGlsZEVsZW1lbnQoaW52b2ljZUVsZW1lbnQsICJjdXN0b21lcl9uYW1lIiwgdHJhbnNhY3Rpb25EYXRhLmN1c3RvbWVyX25hbWUpOwogICAgICBhcHBlbmRDaGlsZEVsZW1lbnQoaW52b2ljZUVsZW1lbnQsICJ0b3RhbF9hbW91bnQiLCB0cmFuc2FjdGlvbkRhdGEudG90YWxfYW1vdW50LnRvRml4ZWQoMikpOwogICAgICBhcHBlbmRDaGlsZEVsZW1lbnQoaW52b2ljZUVsZW1lbnQsICJpbnZvaWNlX2RhdGUiLCB0cmFuc2FjdGlvbkRhdGEuaW52b2ljZV9kYXRlKTsKICAgICAgYXBwZW5kQ2hpbGRFbGVtZW50KGludm9pY2VFbGVtZW50LCAiZHVlX2RhdGUiLCB0cmFuc2FjdGlvbkRhdGEuZHVlX2RhdGUpOwogICAgICBhcHBlbmRDaGlsZEVsZW1lbnQoaW52b2ljZUVsZW1lbnQsICJzZW5kZXJJZCIsIHRyYW5zYWN0aW9uRGF0YS5zZW5kZXJJZCk7CiAgICAgIGFwcGVuZENoaWxkRWxlbWVudChpbnZvaWNlRWxlbWVudCwgInJlY2VpdmVySWQiLCB0cmFuc2FjdGlvbkRhdGEucmVjZWl2ZXJJZCk7CiAgICAgIGFwcGVuZENoaWxkRWxlbWVudChpbnZvaWNlRWxlbWVudCwgIm1lc3NhZ2VJZCIsIHRyYW5zYWN0aW9uRGF0YS5tZXNzYWdlSWQpOwoKICAgICAgLy8gQ3JlYXRlIGFuZCBhcHBlbmQgaXRlbXMKICAgICAgY29uc3QgaXRlbXNFbGVtZW50ID0geG1sRG9jLmNyZWF0ZUVsZW1lbnQoIml0ZW1zIik7CiAgICAgIGludm9pY2VFbGVtZW50LmFwcGVuZENoaWxkKGl0ZW1zRWxlbWVudCk7CgogICAgICB0cmFuc2FjdGlvbkRhdGEuaXRlbXMuZm9yRWFjaChpdGVtID0+IHsKICAgICAgICBjb25zdCBpdGVtRWxlbWVudCA9IHhtbERvYy5jcmVhdGVFbGVtZW50KCJpdGVtIik7CiAgICAgICAgYXBwZW5kQ2hpbGRFbGVtZW50KGl0ZW1FbGVtZW50LCAiaXRlbV9pZCIsIGl0ZW0uaXRlbV9pZCk7CiAgICAgICAgYXBwZW5kQ2hpbGRFbGVtZW50KGl0ZW1FbGVtZW50LCAiaXRlbV9uYW1lIiwgaXRlbS5pdGVtX25hbWUpOwogICAgICAgIGFwcGVuZENoaWxkRWxlbWVudChpdGVtRWxlbWVudCwgInF1YW50aXR5IiwgaXRlbS5xdWFudGl0eSk7CiAgICAgICAgYXBwZW5kQ2hpbGRFbGVtZW50KGl0ZW1FbGVtZW50LCAicHJpY2UiLCBpdGVtLnByaWNlLnRvRml4ZWQoMikpOwogICAgICAgIGl0ZW1zRWxlbWVudC5hcHBlbmRDaGlsZChpdGVtRWxlbWVudCk7CiAgICAgIH0pOwoKICAgICAgLy8gU2VyaWFsaXplIFhNTAogICAgICBjb25zdCBzZXJpYWxpemVyID0gbmV3IFhNTFNlcmlhbGl6ZXIoKTsKICAgICAgbGV0IHhtbFN0cmluZyA9IHNlcmlhbGl6ZXIuc2VyaWFsaXplVG9TdHJpbmcoeG1sRG9jKTsKCiAgICAgIC8vIEFkZCBYTUwgZGVjbGFyYXRpb24KICAgICAgeG1sU3RyaW5nID0gJzw/eG1sIHZlcnNpb249IjEuMCIgZW5jb2Rpbmc9IlVURi04Ij8+XG4nICsgeG1sU3RyaW5nOwoKICAgICAgLy8gTG9nIGFuZCBhc3NpZ24gdGhlIFhNTCBtZXNzYWdlCiAgICAgIGNvbnNvbGUubG9nKCJDb25zdHJ1Y3RlZCBYTUw6ICIsIHhtbFN0cmluZyk7CiAgICAgIHRyYW5zYWN0aW9uUHJvY2Vzc01hbmFnZXIudHJhbnNhY3Rpb24uY3VycmVudE1lc3NhZ2UgPSB4bWxTdHJpbmc7CiAgICAgIHRyYW5zYWN0aW9uUHJvY2Vzc01hbmFnZXIudHJhbnNhY3Rpb24ub3V0cHV0TWVzc2FnZVR5cGUgPSAnWE1MJzsKICAgICAgdHJhbnNhY3Rpb25Qcm9jZXNzTWFuYWdlci50cmFuc2FjdGlvbi5tZXNzYWdlSWQgPSB0cmFuc2FjdGlvbkRhdGEubWVzc2FnZUlkOwogICAgICB0cmFuc2FjdGlvblByb2Nlc3NNYW5hZ2VyLnRyYW5zYWN0aW9uLnNlbmRlcklkID0gdHJhbnNhY3Rpb25EYXRhLnNlbmRlcklkOwogICAgICB0cmFuc2FjdGlvblByb2Nlc3NNYW5hZ2VyLnRyYW5zYWN0aW9uLnJlY2VpdmVySWQgPSB0cmFuc2FjdGlvbkRhdGEucmVjZWl2ZXJJZDsKICAgICAgdHJhbnNhY3Rpb25Qcm9jZXNzTWFuYWdlci50cmFuc2FjdGlvbi5tZXNzYWdlVHlwZSA9IHRyYW5zYWN0aW9uUHJvY2Vzc01hbmFnZXIudHJhbnNhY3Rpb24uaW5wdXRNZXNzYWdlVHlwZSArICctPicgKyB0cmFuc2FjdGlvblByb2Nlc3NNYW5hZ2VyLnRyYW5zYWN0aW9uLm91dHB1dE1lc3NhZ2VUeXBlOwoKICAgICAgcmV0dXJuIHRydWU7CgogICAgfSBjYXRjaCAoZXJyb3IpIHsKICAgICAgY29uc29sZS5lcnJvcigiRXJyb3IgcHJvY2Vzc2luZyBtZXNzYWdlOiIsIGVycm9yKTsKICAgICAgcmV0dXJuIGZhbHNlOwogICAgfQogIH0KfQo=",
    "processingName":"Invoice JSON to XML Mapper",
    "organizationId":organizationId,
  }

  //pickups - pickup_downloadOrders
          Pickup_Orders =  {
            "id":uuidv4(),
            "connectionName":"Download orders from buyer",
            "host":"app.sprintly-exchange.com",
            "port":21,
            "protocol":"FTP",
            "retryInterval":0,
            "retryAttempts":0,
            "authenticationType":"basicAuth",
            "userName":"ftpuser",
            "password":"ftpuser",
            "remotePath":"/home/ftpuser/buyer/orders/download",
            "secure":false,
            "passive":true,
            "timeout":30000,
            "organizationId":organizationId
          };

          Deliver_Orders =  {
            "id":uuidv4(),
            "connectionName":"Deliver orders to supplier",
            "host":"app.sprintly-exchange.com",
            "port":21,
            "protocol":"FTP",
            "retryInterval":0,
            "retryAttempts":0,
            "authenticationType":"basicAuth",
            "userName":"ftpuser",
            "password":"ftpuser",
            "remotePath":"/home/ftpuser/supplier/orders/upload",
            "secure":false,
            "passive":true,
            "timeout":30000,
            "organizationId":organizationId
          };

    //pickups - pickup_downloadOrderResponse
    Pickup_OrderResponses =  {
      "id":uuidv4(),
      "connectionName":"Download order reponses from supplier",
      "host":"app.sprintly-exchange.com",
      "port":21,
      "protocol":"FTP",
      "retryInterval":0,
      "retryAttempts":0,
      "authenticationType":"basicAuth",
      "userName":"ftpuser",
      "password":"ftpuser",
      "remotePath":"/home/ftpuser/supplier/orderresponse/download",
      "secure":false,
      "passive":true,
      "timeout":30000,
      "organizationId":organizationId
    };

    Deliver_OrderResponses =  {
      "id":uuidv4(),
      "connectionName":"Deliver order reponses to buyer",
      "host":"app.sprintly-exchange.com",
      "port":21,
      "protocol":"FTP",
      "retryInterval":0,
      "retryAttempts":0,
      "authenticationType":"basicAuth",
      "userName":"ftpuser",
      "password":"ftpuser",
      "remotePath":"/home/ftpuser/buyer/orderresponse/upload",
      "secure":false,
      "passive":true,
      "timeout":30000,
      "organizationId":organizationId
    };

 //pickups - pickup_downloadOrderResponse
 Pickup_Invoices =  {
      "id":uuidv4(),
      "connectionName":"Download invoices from supplier",
      "host":"app.sprintly-exchange.com",
      "port":21,
      "protocol":"FTP",
      "retryInterval":0,
      "retryAttempts":0,
      "authenticationType":"basicAuth",
      "userName":"ftpuser",
      "password":"ftpuser",
      "remotePath":"/home/ftpuser/supplier/invoice/download",
      "secure":false,
      "passive":true,
      "timeout":30000,
      "organizationId":organizationId
    };

    Deliver_Invoices =  {
      "id":uuidv4(),
      "connectionName":"Deliver invoices to buyer",
      "host":"app.sprintly-exchange.com",
      "port":21,
      "protocol":"FTP",
      "retryInterval":0,
      "retryAttempts":0,
      "authenticationType":"basicAuth",
      "userName":"ftpuser",
      "password":"ftpuser",
      "remotePath":"/home/ftpuser/buyer/invoice/upload",
      "secure":false,
      "passive":true,
      "timeout":30000,
      "organizationId":organizationId
    };

  //pickups - Pickup_PetstoreInvetory
            Pickup_PetstoreInvetory = new ConnectionHTTP(
            'Pickup - Pet Store - Inventory',
            'https://petstore.swagger.io',
            443,
            0,
            0,
            'GET',
            '/v2/store/inventory');
            Pickup_PetstoreInvetory.authenticationType='noAuth';
            Pickup_PetstoreInvetory.headers['Content-Type']="application/json";
            Pickup_PetstoreInvetory.headers['Accept']="application/json";
            Pickup_PetstoreInvetory.organizationId = organizationId;

  //pickups - Pickup_Weather_Data
            Pickup_Weather_Data = new ConnectionHTTP(
                  'Open Weather - Hourly Forecast',
                  'https://pro.openweathermap.org',
                  443,
                  0,
                  0,
                  'GET',
                  '/data/2.5/forecast/hourly?lat=0&lon=0&appid=40c71799f4ef5f1d3e7bc68c1a23ec42');
            Pickup_Weather_Data.authenticationType='noAuth';
            Pickup_Weather_Data.headers['Content-Type']="application/json";
            Pickup_Weather_Data.headers['Accept']="application/json";
            Pickup_Weather_Data.organizationId = organizationId;

//Deliveries Delivery_RecycleBin
            Delivery_RecycleBin = new ConnectionFS('Send to Recycle Bin','/tmp',0,0);

//Deliveries Delivery_PetstoreInventory
            Delivery_PetstoreInventory = new ConnectionHTTP(
                  'Send Pet Store - Inventory',
                  'https://petstore.swagger.io',
                  443,
                  0,
                  0,
                  'POST',
                  '/v2/store/inventory');
            Delivery_PetstoreInventory.authenticationType='noAuth';
            Delivery_PetstoreInventory.headers['Content-Type']="application/json";
            Delivery_PetstoreInventory.headers['Accept']="application/json";
            Delivery_PetstoreInventory.organizationId = organizationId;
  
  //Set processing
            GlobalConfiguration.configurationProcessingMap.set(Processing_code_default.id,Processing_code_default);
            GlobalConfiguration.configurationProcessingMap.set(Invoice_JSON_to_XML_Mapper_Example_Code.id,Invoice_JSON_to_XML_Mapper_Example_Code);
  //Set pickups
            GlobalConfiguration.configurationPickupMap.set(Pickup_PetstoreInvetory.getId(),Pickup_PetstoreInvetory);
            GlobalConfiguration.configurationPickupMap.set(Pickup_Weather_Data.getId(),Pickup_Weather_Data);
            GlobalConfiguration.configurationPickupMap.set(Pickup_Orders.id,Pickup_Orders);
            GlobalConfiguration.configurationPickupMap.set(Pickup_OrderResponses.id,Pickup_OrderResponses);
            GlobalConfiguration.configurationPickupMap.set(Pickup_Invoices.id,Pickup_Invoices);

   //Set deliveries
            GlobalConfiguration.configurationDeliveryMap.set(Delivery_PetstoreInventory.getId(),Delivery_PetstoreInventory);
            GlobalConfiguration.configurationDeliveryMap.set(Delivery_RecycleBin.getId(),Delivery_RecycleBin);
            GlobalConfiguration.configurationDeliveryMap.set(Deliver_Orders.id,Deliver_Orders);
            GlobalConfiguration.configurationDeliveryMap.set(Deliver_OrderResponses.id,Deliver_OrderResponses);
            GlobalConfiguration.configurationDeliveryMap.set(Deliver_Invoices.id,Deliver_Invoices);
   //Set flows
      //Set flows flow_pet_store_inventory
            flow_pet_store_inventory= new Flow("Get petstore inventory",Pickup_PetstoreInvetory.getId(),Delivery_RecycleBin.getId(),Processing_code_default.id);
            flow_pet_store_inventory.organizationId = organizationId;
            flow_pet_store_inventory.activationStatus = false;
      //Set flows flow_weather_data
            flow_weather_data = new Flow("Download weather info",Pickup_Weather_Data.getId(),Delivery_RecycleBin.getId(),Processing_code_default.id);
            flow_weather_data.organizationId = organizationId;
            flow_weather_data.activationStatus = false;
      //Set flows flow_download_orders
            flow_process_orders = new Flow("Process orders",Pickup_Orders.id,Deliver_Orders.id,Processing_code_default.id);
            flow_process_orders.organizationId = organizationId;
            flow_process_orders.activationStatus = false;      
      //Set flows flow_order_respones
            flow_process_order_respones = new Flow("Process order responses",Pickup_OrderResponses.id,Deliver_OrderResponses.id,Processing_code_default.id);
            flow_process_order_respones.organizationId = organizationId;
            flow_process_order_respones.activationStatus = false; 
      //Set flows flow_process_invoices
            flow_process_invoices = new Flow("Process invoices",Pickup_Invoices.id,Deliver_Invoices.id,Invoice_JSON_to_XML_Mapper_Example_Code.id);
            flow_process_invoices.organizationId = organizationId;
            flow_process_invoices.activationStatus = false;  
  
  //set final configuration flows
            GlobalConfiguration.configurationFlowMap.set(flow_pet_store_inventory.getId(),flow_pet_store_inventory); 
            GlobalConfiguration.configurationFlowMap.set(flow_weather_data.getId(),flow_weather_data); 
            GlobalConfiguration.configurationFlowMap.set(flow_process_orders.id,flow_process_orders); 
            GlobalConfiguration.configurationFlowMap.set(flow_process_order_respones.id,flow_process_order_respones); 
            GlobalConfiguration.configurationFlowMap.set(flow_process_invoices.id,flow_process_invoices); 

            demoPickups = [Pickup_PetstoreInvetory.connectionName,Pickup_Weather_Data.connectionName,Pickup_Orders.connectionName,Pickup_OrderResponses.connectionName,Pickup_Invoices.connectionName];
            demoDeliveries = [Delivery_RecycleBin.connectionName,Delivery_PetstoreInventory.connectionName,Deliver_OrderResponses.connectionName,Deliver_Invoices.connectionName];
            demoFlows = [flow_pet_store_inventory.flowName,flow_weather_data.flowName,flow_process_orders.flowName,flow_process_orders.flowName,flow_process_invoices];
            return true;
}

export function removeDemoCases(organizationId:string){
    console.log("Removing all flows for org id : ",organizationId);
    try{
      const flowsToDelete = [...GlobalConfiguration.configurationFlowMap.values()].filter((record) => record.organizationId === organizationId);
      // Step 2: Delete the filtered records using their id
      flowsToDelete.forEach((record) => {
          // Assuming configurationFlowMap is a Map where the key is the id of the flow
          if(demoFlows.includes(record.flowName)){
            GlobalConfiguration.configurationFlowMap.delete(record.id);
          }
            
      });

      const pickupsToDelete = [...GlobalConfiguration.configurationPickupMap.values()].filter((record) => record.organizationId === organizationId);
      // Step 2: Delete the filtered records using their id
      pickupsToDelete.forEach((record) => {
          // Assuming configurationFlowMap is a Map where the key is the id of the flow
          if(demoPickups.includes(record.connectionName)){
            GlobalConfiguration.configurationPickupMap.delete(record.id);
          }
      });

      const deliveriesToDelete = [...GlobalConfiguration.configurationDeliveryMap.values()].filter((record) => record.organizationId === organizationId);
      // Step 2: Delete the filtered records using their id
      deliveriesToDelete.forEach((record) => {
          // Assuming configurationFlowMap is a Map where the key is the id of the flow
          if(demoDeliveries.includes(record.connectionName)){
            GlobalConfiguration.configurationDeliveryMap.delete(record.id);
          }
      });
          
      return true;
    }catch(error){
          //Do nothing
      return false;
    }
}
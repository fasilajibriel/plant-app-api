const {Client} = require("pg");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const client = new Client({
    "user": "waqufrcs",
    "password": "WEhbPBRe7G33dNrFxH_Fy4xPK82_vo-p",
    "host": "investment-admin.ca0xvoihrw52.us-east-1.rds.amazonaws.com",
    "port": 5432,
    "database": "waqufrcs"
});


app.get("/api", (req, res) => res.sendFile(`${__dirname}/some.html`));

// GET SHAPES
app.get("/api/shapes", async (req, res) => {
    const rows = await getShapes();
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify(rows))
});
async function getShapes() {
    const query = "SELECT json_build_object('type', 'FeatureCollection', 'crs',  json_build_object('type', 'name', 'properties', json_build_object('name', 'EPSG:4326')), 'features', json_agg( json_build_object('type', 'Feature', 'geometry', ST_AsGeoJSON(o.geom)::json, 'properties', json_build_object('id', o_id, 'centroidx', centroidx, 'centroidy', centroidy)))) FROM opportunities o where geom notnull and o.o_is_paused != 1 and o.o_status != 0;"
    try {
        const results = await client.query(query);
        return results.rows;
    } catch (e) {
        return [];
    }
}

app.get("/api/allShapes", async (req, res) => {
    const rowOne = await readShapedZones();
    const rowTwo = await readShapedRegions();
    const rowThree = await readOpportunities();
    const rows = [rowOne, rowTwo, rowThree];
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify(rows))
});

// GET OPPORTUNITY COUNT
app.get("/api/oppCount", async (req, res) => {
    let result = {};
    try {
        const reqJson = req.query.zone;
        result = await countOpportunity(reqJson);
        result.success = true;
    } catch (e) {
        result.success = false;
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function countOpportunity(zoneId) {
    const logData = "select count(o_name) from opportunities where o_zone_id = " + zoneId;
    try {
        const results = await client.query(logData);
        return results.rows;
    } catch (e) {
        return [];
    }
}

// GET OPPORTUNITY COUNT OF REGION
app.get("/api/regionOpportunityCount", async (req, res) => {
    let result = {};
    try {
        const reqJson = req.query.region;
        result = await countRegionOpportunity(reqJson);
        result.success = true;
    } catch (e) {
        result.success = false;
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function countRegionOpportunity(regionId) {
    try {
        const results = await client.query("select count(o_name) from opportunities where o_status = 1 and o_regn_id = $1", [regionId]);
        return results.rows;
    } catch (e) {
        return [];
    }
}

// GET OPPORTUNITIES
app.get("/api/opportunities", async (req, res) => {
    if (req.query.oppId !== 'undefined') {
        let result = {};
        try {
            const reqJson = req.query.oppId;
            result = await readOpportunity(reqJson);
            result.success = true;
        } catch (e) {
            result.success = false;
        } finally {
            res.setHeader("content-type", "application/json");
            res.send(JSON.stringify(result))
        }
    }
    else {
        const rows = await readOpportunities();
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(rows))
    }
});
async function readOpportunities() {
    try {
        const results = await client.query("select * from opportunities o inner join catagory_details cd on cd.catagory_detail_id = o.o_catagory inner join groups g on g.group_id = cd.catagory_detail_group_id inner join major_groups mg on mg.major_group_id = g.group_major_group_id inner join divisions d on d.division_id  = mg.major_group_division_id inner join major_catagories mc on mc.major_catagory_id  = d.division_major_catagory_id inner join regions r on r.region_id = o.o_region where o.o_is_paused != 1 and o.o_status = 1");
        return results.rows;
    } catch (e) {
        return [];
    }
}
async function readOpportunity(oppId) {
    try {
        const results = await client.query("select * from opportunities o inner join catagory_details cd on cd.catagory_detail_id = o.o_catagory inner join groups g on g.group_id = cd.catagory_detail_group_id inner join major_groups mg on mg.major_group_id = g.group_major_group_id inner join divisions d on d.division_id  = mg.major_group_division_id inner join major_catagories mc on mc.major_catagory_id  = d.division_major_catagory_id inner join regions r on r.region_id = o.o_region where o.o_is_paused != 1 and o.o_status = 1 and o_id = $1", [oppId]);
        return results.rows;
    } catch (e) {
        return [];
    }
}

// GET ATTACHMENTS
app.get("/api/attachments", async (req, res) => {
    let result = {};
    try {
        const reqJson = req.query.oppId;
        result = await readAttachment(reqJson);
        result.success = true;
    } catch (e) {
        result.success = false;
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function readAttachment(oppId) {
    try {
        const results = await client.query("SELECT * FROM public.attachments where attachment_opportunity_id = $1", [oppId]);
        return results.rows;
    } catch (e) {
        return [];
    }
}

// GET SECTOR LOCATIONS
app.get("/api/sectorLocations", async (req, res) => {
    let result = {};
    try {
        const reqJson = req.query.sectorId;
        result = await readSectorLocations(reqJson);
        result.success = true;
    } catch (e) {
        result.success = false;
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function readSectorLocations(sectorId) {
    try {
        const results = await client.query("select * from strategic_sector_locations l inner join strategic_sectors s on s.strategic_sector_id = l.strategic_sector_location_sector where strategic_sector_location_status = 1 and strategic_sector_location_sector = $1;", [sectorId]);
        return results.rows;
    } catch (e) {
        return [];
    }
}

app.get("/api/allSectorLocations", async (req, res) => {
    let result = {};
    try {
        const reqJson = req.query.sectorId;
        result = await readAllSectorLocations();
        result.success = true;
    } catch (e) {
        result.success = false;
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function readAllSectorLocations() {
    try {
        const results = await client.query("select * from strategic_sector_locations l inner join strategic_sectors s on s.strategic_sector_id = l.strategic_sector_location_sector where strategic_sector_location_status = 1;");
        return results.rows;
    } catch (e) {
        return [];
    }
}

// GET REGIONS
app.get("/api/regions", async (req, res) => {
    const rows = await readRegions();
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify(rows))
});
async function readRegions() {
    try {
        const results = await client.query("select region_id, region_name from regions where region_is_deleted != 1");
        return results.rows;
    } catch (e) {
        return [];
    }
}

app.get("/api/shapedRegions", async (req, res) => {
    const rows = await readShapedRegions();
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify(rows))
});
async function readShapedRegions() {
    const query = "SELECT json_build_object( 'type', 'FeatureCollection', 'crs',  json_build_object( 'type', 'name', 'properties', json_build_object( 'name', 'EPSG:4326' ) ), 'features', json_agg( json_build_object( 'type', 'Feature', 'geometry', ST_AsGeoJSON(r.geom)::json, 'properties', json_build_object( 'id', region_id, 'name', region_name, 'icon', region_profile_picture ) ) ) ) FROM regions r where geom notnull and r.region_is_deleted != 1 and r.region_status != 0;"
    try {
        const results = await client.query(query);
        return results.rows;
    } catch (e) {
        return [];
    }
}

// GET ZONE
app.get("/api/shapedZones", async (req, res) => {
    let result = {};
        try {
            const reqJson = req.query.regName;
            result = await readShapedZones(reqJson);
            result.success = true;
        } catch (e) {
            result.success = false;
        } finally {
            res.setHeader("content-type", "application/json");
            res.send(JSON.stringify(result))
        }
});
async function readShapedZones(regionName) {
    const query = "SELECT json_build_object( 'type', 'FeatureCollection', 'crs',  json_build_object( 'type', 'name', 'properties', json_build_object( 'name', 'EPSG:4326' ) ), 'features', json_agg( json_build_object( 'type', 'Feature', 'geometry', ST_AsGeoJSON(z.geom)::json, 'properties', json_build_object( 'id', id, 'name', name_2, 'region', name_1 ) ) ) ) FROM zonex z where geom notnull and name_1 = $1;"
    try {
        const results = await client.query(query, [regionName]);
        return results.rows;
    } catch (e) {
        return [];
    }
}

// GET AMENITIES
app.get("/api/amenities", async (req, res) => {
    const rows = await readAmenities();
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify(rows))
});
async function readAmenities() {
    try {
        const results = await client.query("select * from amenities where amenity_is_deleted != 1");
        return results.rows;
    } catch (e) {
        return [];
    }
}

// GET IP ATTACHMENT
app.get("/api/ipAttachments", async (req, res) => {
    const rows = await readIpAttachments();
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify(rows))
});
async function readIpAttachments() {
    try {
        const results = await client.query("SELECT * FROM ip_attachments;");
        return results.rows;
    } catch (e) {
        return [];
    }
}

// GET IPS
app.get("/api/ips", async (req, res) => {
    const rows = await readIPS();
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify(rows))
});
async function readIPS() {
    try {
        const results = await client.query("SELECT json_build_object( 'type', 'FeatureCollection', 'crs', json_build_object( 'type', 'name',  'properties', json_build_object( 'name', 'EPSG:4326' ) ), 'features', json_agg( json_build_object( 'type', 'Feature', 'geometry', ST_AsGeoJSON(i.industry_park_geom)::json, 'properties', json_build_object( 'id', industry_park_id, 'name', industry_park_name, 'description', industry_park_description, 'isLandAvailable', industry_park_land_available, 'regionId', industry_park_region, 'picture', industry_park_profile_picture, 'landSize', industry_park_land_size, 'specialization', industry_park_specialization, 'shedOverview', industry_park_sheds_overview, 'facility', industry_park_sust_facility, 'logisticsOverview', industry_park_logistics_overview, 'population', industry_park_population, 'employees', industry_park_expected_employees, 'trainings', industry_park_sourcing_training, 'housing', industry_park_housing, 'waterCost', industry_park_water_cost, 'electricCost', industry_park_electric_cost, 'leaseCost', industry_park_sheds_lease_cost_per_month, 'exportValue', industry_park_export_value, 'companies', industry_park_no_companies, 'occupiedSheds', industry_park_sheds_occupied, 'attachmentId', industry_park_attachment_id, 'contact', industry_park_contact, 'distanceFromCityCenter', industry_park_df_city_center, 'distanceFromAddisCity', industry_park_df_addis_ababa, 'distanceFromAddisAirport', industry_park_df_aa_airport, 'distanceFromNearestAirport', industry_park_df_near_airport, 'isPrivate', industry_park_is_private, 'dfCityCenter', industry_park_df_city_center_coordinate, 'dfAddisAbaba', industry_park_df_addis_ababa_coordinate, 'dfNearAirport', industry_park_df_near_airport_coordinate, 'dfAddisAirport', industry_park_df_aa_airport_coordinate ) ) ) ) FROM industry_parks i where industry_park_geom notnull and i.industry_park_is_deleted = 0 and i.industry_park_status = 1;");
        // const results = await client.query("select * from industry_parks;");
        return results.rows;
    } catch (e) {
        return [];
    }
}

// GET STRATEGIC SECTORS
app.get("/api/strategicSectors", async (req, res) => {
    const rows = await readStrategicSectors();
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify(rows))
});
async function readStrategicSectors() {
    try {
        const results = await client.query("select * from strategic_sectors where strategic_sector_status = 1 and strategic_sector_is_deleted = 0 ORDER BY strategic_sector_order ASC");
        return results.rows;
    } catch (e) {
        return [];
    }
}

// GET CATEGORIES
app.get("/api/categories", async (req, res) => {
    const rows = await readCategories();
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify(rows))
});
async function readCategories() {
    try {
        const results = await client.query("select * from categories");
        return results.rows;
    } catch (e) {
        return [];
    }
}

// GET MAJOR CATEGORIES
app.get("/api/majorCategories", async (req, res) => {
    const rows = await readMajorCategories();
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify(rows))
});
async function readMajorCategories() {
    try {
        const results = await client.query("select * from major_catagories where major_catagory_is_deleted != 1");
        return results.rows;
    } catch (e) {
        return [];
    }
}



// Accounts
app.post("/api/getUser", async (req, res) => {
    let result = {};
    try {
        const reqJson = req.body;
        result = await readAccounts(reqJson.email, reqJson.password);
        result.success = true;
    } catch (e) {
        result.success = false;
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function readAccounts(email, password) {
    try {
        const results = await client.query("select * from accounts where account_email = $1 and account_password = $2", [email, password]);
        return results.rows[0];
    } catch (e) {
        return [];
    }
}


app.get("/api/getUserNotifications", async (req, res) => {
    let result = {};
    try {
        const reqJson = req.body;
        result = await readNotifications(reqJson.accountId);
        result.success = true;
    } catch (e) {
        result.success = false;
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function readNotifications(accountId) {
    try {
        const results = await client.query("select * from notifications where account_id = $1", [accountId]);
        return results.rows;
    } catch (e) {
        return [];
    }
}


app.get("/api/getUserRequests", async (req, res) => {
    let result = {};
    try {
        const reqJson = req.query.uId;
        result = await getUserRequests(reqJson);
        result.success = true;
    } catch (e) {
        result.success = false;
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function getUserRequests(accountId) {
    try {
        const results = await client.query("select r.request_opportunity_id, o.o_name from requests r inner join opportunities o on o.o_id = r.request_opportunity_id where request_user_id = $1", [accountId]);
        return results.rows;
    } catch (e) {
        return [];
    }
}

app.get("/api/getRequestTimeline", async (req, res) => {
    let result = {};
    try {
        const reqJson = req.query.uId;
        result = await getRequestTimeline(reqJson);
        result.success = true;
    } catch (e) {
        result.success = false;
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function getRequestTimeline(accountId) {
    try {
        const results = await client.query("select t.timeline_action , r.request_opportunity_id , a.account_id from timelines t inner join requests r on r.request_id  = t.timeline_request_id inner join accounts a on a.account_id  = r.request_user_id where a.account_id = $1", [accountId]);
        return results.rows;
    } catch (e) {
        return [];
    }
}


app.get("/api/getUserFeedbacks", async (req, res) => {
    let result = {};
    try {
        const reqJson = req.query.uId;
        result = await getUserFeedbacks(reqJson);
        result.success = true;
    } catch (e) {
        result.success = false;
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function getUserFeedbacks(accountId) {
    try {
        const results = await client.query("select * from feedbacks where feedback_account_id = $1;", [accountId]);
        return results.rows;
    } catch (e) {
        return [];
    }
}


app.get("/api/getUserFavorites", async (req, res) => {
    let result = {};
    try {
        const reqJson = req.query.uId;
        result = await readUserFavorites(reqJson);
        result.success = true;
    } catch (e) {
        result.success = false;
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function readUserFavorites(accountId) {
    try {
        const results = await client.query("select f.favorite_opportunity_id, f.favorite_created_date, o.o_name from favorites f inner join opportunities o on o.o_id = f.favorite_opportunity_id where f.favorite_user_id = $1 and favorite_is_deleted = 0", [accountId]);
        return results.rows;
    } catch (e) {
        return [];
    }
}


/* Write functions */

// SUBMIT REQUEST
app.post("/api/registerUser", async (req, res) => {
    let result = {};
    try {
        const reqJson = req.body;
        console.log(
            reqJson.firstName +
            reqJson.lastName +
            reqJson.email +
            reqJson.passwordVal +
            reqJson.date);
        await registerUser(
            reqJson.firstName,
            reqJson.lastName,
            reqJson.email,
            reqJson.passwordVal,
            reqJson.date
        );
        result.success = true;
    } catch (e) {
        result.success = false;
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function registerUser(fName, lName, email, passwordVal, cdate) {
    console.log(fName + lName + email + passwordVal + cdate);
    try {
        await client.query("INSERT INTO public.accounts(account_first_name, account_last_name, account_email, account_password, account_country, account_region, account_city, account_phone, account_role_id, account_status, account_created_date, account_is_deleted, account_work, account_website, account_company, account_profile_picture) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);", [fName, lName, email, passwordVal, 'Ethiopia', 'Oromia', 'Addis Ababa', 912345678, 1, 1, cdate, 0, 'null', 'null', 'null', 'null']);
        return true
    } catch (e) {
        return false;
    }
}

// SUBMIT REQUEST
app.post("/api/submitRequests", async (req, res) => {
    let result = {};
    try {
        const reqJson = req.body;
        await submitRequest(reqJson.uId, reqJson.oId, reqJson.date);
        result.success = true;
    } catch (e) {
        result.success = false;
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function submitRequest(user_id, opp_id, date_created) {
    try {
        await client.query("INSERT INTO public.requests(request_user_id, request_opportunity_id, request_status, request_is_seen, request_created_date, request_process_status, request_is_deleted) VALUES ($1, $2, $3, $4, $5, $6, $7);", [user_id, opp_id, 0, 0, date_created, 0, 0]);
        return true
    } catch (e) {
        return false;
    }
}

// SUBMIT FEEDBACK
app.post("/api/submitFeedback", async (req, res) => {
    let result = {};
    try {
        const reqJson = req.body;
        await submitFeedback(reqJson.name, reqJson.email, reqJson.date, reqJson.cntnt);
        result.success = true;
    } catch (e) {
        result.success = false;
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function submitFeedback(user_name, user_email, date_created, content) {
    try {
        await client.query("INSERT INTO public.feedbacks(feedback_content, feedback_status, feedback_created_date, feedback_is_deleted, feedback_name, feedback_email)\tVALUES ($1, $2, $3, $4, $5, $6);", [content, 0, date_created, 0, user_name, user_email]);
        return true
    } catch (e) {
        return false;
    }
}


app.post("/api/submitFavorite", async (req, res) => {
    let result = {};
    try {
        const reqJson = req.body;
        await submitFavorite(reqJson.uId, reqJson.oId, reqJson.date);
        result.success = true;
    } catch (e) {
        result.success = false;
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function submitFavorite(user_id, opp_id, date_created) {
    try {
        await client.query("INSERT INTO public.favorites(favorite_user_id, favorite_opportunity_id, favorite_status, favorite_is_deleted, favorite_created_date) values ($1, $2, $3, $4, $5)", [user_id, opp_id, 0, 0, date_created]);
        return true
    } catch (e) {
        return false;
    }
}


/*Update Functions*/

// UPDATE USER INFO
app.post("/api/updateUser", async (req, res) => {
    let result = {};
    try {
        const reqJson = req.body;
        await updateUser(reqJson.uid, reqJson.fName, reqJson.lName, reqJson.email, reqJson.phoneNumber, reqJson.cityName, reqJson.country, reqJson.region, reqJson.company, reqJson.site);
        // console.log(result);
        result.success = true;
    } catch (e) {
        result.success = false;
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function updateUser(userId, fName, lName, email, phoneNumber, cityName, country, region, company, site) {
    try {
        // console.log("UPDATE public.accounts SET account_first_name=$1, account_last_name=$2, account_email=$3, account_country=$4, account_region=$5, account_city=$6, account_phone=$7, account_website=$8, account_company=$9 WHERE account_id=$10;", [fName, lName, email, country, region, cityName, phoneNumber, site, company, userId])
        await client.query("UPDATE public.accounts SET account_first_name=$1, account_last_name=$2, account_email=$3, account_country=$4, account_region=$5, account_city=$6, account_phone=$7, account_website=$8, account_company=$9 WHERE account_id=$10;", [fName, lName, email, country, region, cityName, phoneNumber, site, company, userId]);
        return true
    } catch (e) {
        return false;
    }
}

// UPDATE USER INFO
/*app.post("/api/updateUser", async (req, res) => {
    let result = {};
    try {
        const reqJson = req.body;
        await updateUser(reqJson.uid, reqJson.fName, reqJson.lName, reqJson.email, reqJson.phoneNumber, reqJson.cityName);
        console.log(result);
        result.success = true;
    } catch (e) {
        result.success = false;
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function updateUser(userId, fName, lName, email, phoneNumber, cityName) {
    try {
        await client.query("UPDATE public.accounts SET account_first_name=$1, account_last_name=$2, account_email=$3, account_city=$4, account_phone=$5 WHERE account_id=$7;", [fName, lName, email, cityName, phoneNumber, userId]);
        return true
    } catch (e) {
        return false;
    }
}*/

/*Delete Functions*/
app.delete("/todos", async (req, res) => {
    let result = {};
    try {
        const reqJson = req.body;
        await deleteTodo(reqJson.id);
        result.success = true;
    } catch (e) {
        result.success = false;
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function deleteTodo(id) {

    try {
        await client.query("delete from todos where id = $1", [id]);
        return true
    } catch (e) {
        return false;
    }
}

app.listen(8080, () => console.log("Web server is listening.. on port 8080"));

start();

async function start() {
    await connect();
}

async function connect() {
    try {
        await client.connect();
    } catch (e) {
        console.error(`Failed to connect ${e}`)
    }
}
